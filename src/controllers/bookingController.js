import prisma from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createNotification } from '../utils/notifications.js';

/**
 * Get user bookings
 */
export const getBookings = asyncHandler(async (req, res) => {
  const { status, type } = req.query;
  const where = {};

  // Filter by user role
  if (req.userRole === 'CLIENT') {
    where.clientId = req.user.client?.id || req.userId;
  } else if (req.userRole === 'CONSULTANT') {
    const consultant = await prisma.consultant.findUnique({
      where: { userId: req.userId },
    });
    if (consultant) {
      where.consultantId = consultant.id;
    }
  }

  // Handle status filter - support comma-separated values
  if (status) {
    const statusArray = status.split(',');
    if (statusArray.length > 1) {
      where.status = { in: statusArray };
    } else {
      where.status = status;
    }
  }
  if (type) where.bookingType = type;

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      client: {
        include: { user: { select: { email: true, phone: true } } },
      },
      consultant: {
        include: { user: { select: { email: true, phone: true } } },
      },
      service: true,
      session: true,
      report: true,
      payment: true,
    },
    orderBy: { scheduledAt: 'desc' },
  });

  res.json({ bookings });
});

/**
 * Get booking by ID
 */
export const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      client: {
        include: { user: true },
      },
      consultant: {
        include: { user: true },
      },
      service: true,
      session: {
        include: { messages: true },
      },
      report: true,
      payment: true,
    },
  });

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Check authorization
  if (
    req.userRole !== 'ADMIN' &&
    req.userRole !== 'SUPER_ADMIN' &&
    booking.client?.userId !== req.userId &&
    booking.consultant?.userId !== req.userId
  ) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json({ booking });
});

/**
 * Create booking (Client only)
 */
export const createBooking = asyncHandler(async (req, res) => {
  if (req.userRole !== 'CLIENT') {
    return res.status(403).json({ error: 'Only clients can create bookings' });
  }

  const {
    consultantId,
    serviceId,
    bookingType,
    scheduledAt,
    selectedTimeSlot,
    duration,
    price,
    clientNotes,
    paymentStatus,
    paymentMethod,
    transactionId,
    paymentDetails,
  } = req.body;

  // Get client record
  const client = await prisma.client.findUnique({
    where: { userId: req.userId },
  });

  if (!client) {
    return res.status(404).json({ error: 'Client record not found' });
  }

  // Verify consultant exists and is available
  const consultant = await prisma.consultant.findUnique({
    where: { id: consultantId },
    include: { user: true },
  });

  if (!consultant || !consultant.isAvailable) {
    return res.status(400).json({ error: 'Consultant not available' });
  }

  // Handle Payment Record Creation/Update first to avoid nested write issues
  let paymentRecordId = null;

  if (paymentStatus === 'PAID' && transactionId) {
      try {
        const payment = await prisma.payment.upsert({
            where: { transactionId: transactionId },
            update: {
                status: 'COMPLETED',
                clientId: client.id,
                consultantId,
                amount: parseFloat(price || consultant.pricePerSession),
                method: paymentMethod === 'mada' ? 'MADA' : paymentMethod === 'applepay' ? 'APPLE_PAY' : 'CREDIT_CARD',
                gatewayResponse: paymentDetails,
            },
            create: {
                clientId: client.id,
                consultantId,
                amount: parseFloat(price || consultant.pricePerSession),
                method: paymentMethod === 'mada' ? 'MADA' : paymentMethod === 'applepay' ? 'APPLE_PAY' : 'CREDIT_CARD',
                status: 'COMPLETED',
                transactionId: transactionId,
                gatewayResponse: paymentDetails,
            }
        });
        paymentRecordId = payment.id;
      } catch (error) {
          console.error('Error upserting payment record:', error);
          // Continue booking creation even if payment record fails? 
          // Better to fail or rely on transactionId in booking
      }
  }

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      clientId: client.id,
      consultantId,
      serviceId,
      bookingType,
      scheduledAt: new Date(scheduledAt),
      selectedTimeSlot,
      duration: parseInt(duration),
      price: parseFloat(price || consultant.pricePerSession),
      clientNotes,
      status: 'PENDING',
      paymentStatus: paymentStatus === 'PAID' ? 'COMPLETED' : 'PENDING',
      paymentId: paymentRecordId, // manual link
      // Removed nested 'payment' write
  },
    include: {
      consultant: {
        include: { user: true },
      },
      service: true,
    },
  });

  // Create notification for consultant
  await createNotification({
    userId: consultant.userId,
    type: 'NEW_BOOKING',
    title: 'New Booking Request',
    message: `You have a new booking request from ${req.user.client?.firstName || 'a client'}`,
    link: `/consultant/bookings/${booking.id}`,
    metadata: { bookingId: booking.id },
  });

  res.status(201).json({
    message: 'Booking created successfully',
    booking,
  });
});

/**
 * Update booking status (Consultant/Admin)
 */
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, consultantNotes } = req.body;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      client: { include: { user: true } },
      consultant: { include: { user: true } },
    },
  });

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Check authorization
  const isConsultant = req.userRole === 'CONSULTANT' && booking.consultant.userId === req.userId;
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.userRole);

  if (!isConsultant && !isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const updateData = { status };
  if (consultantNotes) updateData.consultantNotes = consultantNotes;
  if (status === 'COMPLETED') updateData.completedAt = new Date();

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: updateData,
  });

  // Create notification for client
  await createNotification({
    userId: booking.client.userId,
    type: status === 'CONFIRMED' ? 'BOOKING_CONFIRMED' : 'BOOKING_CANCELLED',
    title: `Booking ${status.toLowerCase()}`,
    message: `Your booking has been ${status.toLowerCase()}`,
    link: `/client/bookings/${booking.id}`,
  });

  res.json({
    message: 'Booking status updated successfully',
    booking: updatedBooking,
  });
});

/**
 * Cancel booking
 */
export const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      client: { include: { user: true } },
      consultant: { include: { user: true } },
    },
  });

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Check authorization
  const isOwner = booking.clientId === req.userId;
  const isConsultant = req.userRole === 'CONSULTANT' && booking.consultant.userId === req.userId;
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.userRole);

  if (!isOwner && !isConsultant && !isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: {
      status: 'CANCELLED',
    },
  });

  // Notify the other party
  const notifyUserId = isOwner ? booking.consultant.userId : booking.client.userId;
  await createNotification({
    userId: notifyUserId,
    type: 'BOOKING_CANCELLED',
    title: 'Booking Cancelled',
    message: 'A booking has been cancelled',
    link: `/bookings/${booking.id}`,
  });

  res.json({
    message: 'Booking cancelled successfully',
    booking: updatedBooking,
  });
});

/**
 * Rate booking (Client only)
 */
export const rateBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (req.userRole !== 'CLIENT') {
    return res.status(403).json({ error: 'Only clients can rate bookings' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { consultant: true },
  });

  if (!booking || booking.clientId !== req.userId) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  if (booking.status !== 'COMPLETED') {
    return res.status(400).json({ error: 'Can only rate completed bookings' });
  }

  // Update booking rating
  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: { rating: parseInt(rating), comment },
  });

  // Update consultant rating
  const consultant = await prisma.consultant.findUnique({
    where: { id: booking.consultantId },
  });

  const totalRatings = consultant.totalRatings + 1;
  const newRating = ((consultant.rating * consultant.totalRatings) + parseInt(rating)) / totalRatings;

  await prisma.consultant.update({
    where: { id: booking.consultantId },
    data: {
      rating: newRating,
      totalRatings: totalRatings,
    },
  });

  res.json({
    message: 'Rating submitted successfully',
    booking: updatedBooking,
  });
});

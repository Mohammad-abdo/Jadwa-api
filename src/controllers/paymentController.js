import prisma from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { createNotification } from "../utils/notifications.js";

/**
 * Create payment
 */
export const createPayment = asyncHandler(async (req, res) => {
  const { bookingId, method, transactionId, gatewayResponse } = req.body;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      client: { include: { user: true } },
      consultant: { include: { user: true } },
    },
  });

  if (!booking) {
    return res
      .status(404)
      .json({ error: "Booking not found please call support" });
  }

  if (
    booking.clientId !== req.userId &&
    !["ADMIN", "SUPER_ADMIN"].includes(req.userRole)
  ) {
    return res.status(403).json({ error: "Access denied" });
  }

  // Generate invoice number
  const invoiceNumber = `INV-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;

  const payment = await prisma.payment.create({
    data: {
      bookingId,
      clientId: booking.clientId,
      consultantId: booking.consultantId,
      amount: booking.price,
      currency: "SAR",
      method,
      status: "PENDING",
      transactionId,
      invoiceNumber,
      gatewayResponse: gatewayResponse ? JSON.stringify(gatewayResponse) : null,
    },
  });

  // Update booking payment status
  await prisma.booking.update({
    where: { id: bookingId },
    data: { paymentId: payment.id, paymentStatus: "PENDING" },
  });

  res.status(201).json({
    message: "Payment created successfully",
    payment,
  });
});

/**
 * Update payment status (Webhook/Admin)
 */
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, transactionId, failureReason } = req.body;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          client: { include: { user: true } },
          consultant: { include: { user: true } },
        },
      },
    },
  });

  if (!payment) {
    return res.status(404).json({ error: "Payment not found" });
  }

  const updateData = { status };
  if (transactionId) updateData.transactionId = transactionId;
  if (failureReason) updateData.failureReason = failureReason;
  if (status === "COMPLETED") {
    updateData.paidAt = new Date();
  }

  const updatedPayment = await prisma.payment.update({
    where: { id },
    data: updateData,
  });

  // Update booking payment status
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { paymentStatus: status },
  });

  // If payment completed, create earning for consultant
  if (status === "COMPLETED") {
    const platformCommissionRate = 0.15; // 15% - should come from system settings
    const platformFee = payment.amount * platformCommissionRate;
    const netAmount = payment.amount - platformFee;

    await prisma.earning.create({
      data: {
        consultantId: payment.consultantId,
        paymentId: payment.id,
        amount: payment.amount,
        platformFee,
        netAmount,
        status: "available",
      },
    });

    // Update consultant total earnings
    await prisma.consultant.update({
      where: { id: payment.consultantId },
      data: {
        totalEarnings: {
          increment: netAmount,
        },
      },
    });

    // Notify consultant
    await createNotification({
      userId: payment.booking.consultant.userId,
      type: "PAYMENT_RECEIVED",
      title: "Payment Received",
      message: `Payment of ${netAmount} SAR has been added to your earnings`,
      link: `/consultant/earnings`,
    });
  }

  // Notify client
  await createNotification({
    userId: payment.booking.client.userId,
    type: "PAYMENT_RECEIVED",
    title: `Payment ${status}`,
    message: `Your payment has been ${status.toLowerCase()}`,
    link: `/client/payments/${payment.id}`,
  });

  res.json({
    message: "Payment status updated successfully",
    payment: updatedPayment,
  });
});

/**
 * Get user payments
 */
export const getPayments = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const where = {};

  if (req.userRole === "CLIENT") {
    where.clientId = req.userId;
  } else if (req.userRole === "CONSULTANT") {
    const consultant = await prisma.consultant.findUnique({
      where: { userId: req.userId },
    });
    where.consultantId = consultant.id;
  }

  if (status) where.status = status;

  const payments = await prisma.payment.findMany({
    where,
    include: {
      booking: {
        include: {
          service: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ payments });
});

/**
 * Get payment by ID
 */
export const getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      booking: true,
      earnings: true,
    },
  });

  if (!payment) {
    return res.status(404).json({ error: "Payment not found" });
  }

  res.json({ payment });
});

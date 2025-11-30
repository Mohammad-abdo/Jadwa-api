import prisma from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createNotification } from '../utils/notifications.js';

/**
 * Start session
 */
export const startSession = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { roomId } = req.body;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      consultant: { include: { user: true } },
      client: { include: { user: true } },
    },
  });

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Check authorization
  const isConsultant = req.userRole === 'CONSULTANT' && booking.consultant.userId === req.userId;
  const isClient = req.userRole === 'CLIENT' && booking.client.userId === req.userId;

  if (!isConsultant && !isClient) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Determine session type
  const sessionType = booking.bookingType === 'VIDEO_CALL' ? 'video' : 'chat';

  // Create or update session
  let session = await prisma.session.findUnique({
    where: { bookingId },
  });

  if (session) {
    session = await prisma.session.update({
      where: { bookingId },
      data: {
        status: 'IN_PROGRESS',
        startTime: new Date(),
        roomId: roomId || session.roomId,
      },
    });
  } else {
    session = await prisma.session.create({
      data: {
        bookingId,
        sessionType,
        status: 'IN_PROGRESS',
        startTime: new Date(),
        roomId,
      },
    });
  }

  // Notify the other party
  const notifyUserId = isConsultant ? booking.client.userId : booking.consultant.userId;
  await createNotification({
    userId: notifyUserId,
    type: 'APPOINTMENT_REMINDER',
    title: 'Session Started',
    message: 'The consultation session has started',
    link: `/sessions/${session.id}`,
  });

  res.json({
    message: 'Session started successfully',
    session,
  });
});

/**
 * End session
 */
export const endSession = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const session = await prisma.session.findUnique({
    where: { bookingId },
    include: {
      booking: true,
    },
  });

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const startTime = session.startTime || new Date();
  const endTime = new Date();
  const duration = Math.floor((endTime - startTime) / 1000 / 60); // in minutes

  const updatedSession = await prisma.session.update({
    where: { bookingId },
    data: {
      status: 'COMPLETED',
      endTime,
      duration,
    },
  });

  // Update booking status to COMPLETED if not already completed
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'COMPLETED',
      completedAt: endTime,
    },
  });

  res.json({
    message: 'Session ended successfully',
    session: updatedSession,
  });
});

/**
 * Get session by booking ID
 */
export const getSessionByBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  // First verify booking exists
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      client: { include: { user: true } },
      consultant: { include: { user: true } },
      service: true,
    },
  });

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Try to find session
  const session = await prisma.session.findUnique({
    where: { bookingId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 50, // Last 50 messages
      },
    },
  });

  // Return session with booking, even if session doesn't exist yet
  res.json({ 
    session: session ? {
      ...session,
      booking,
    } : {
      bookingId,
      booking,
      status: 'SCHEDULED',
    }
  });
});

/**
 * Generate video room (Zoom/Twilio)
 */
export const generateVideoRoom = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      consultant: { include: { user: true } },
      client: { include: { user: true } },
    },
  });

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Check authorization
  const isConsultant = req.userRole === 'CONSULTANT' && booking.consultant.userId === req.userId;
  const isClient = req.userRole === 'CLIENT' && booking.client.userId === req.userId;

  if (!isConsultant && !isClient) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Generate room ID (in production, integrate with Zoom/Twilio API)
  // For development, using Jitsi Meet (free service)
  // In production, replace with your own Jitsi instance or Zoom/Twilio
  // Generate room ID (in production, integrate with Zoom/Twilio API)
  // For development, using Jitsi Meet (free service)
  // Create a URL-safe room name (only alphanumeric and hyphens, no special chars)
  const cleanBookingId = bookingId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  const timestamp = Date.now().toString().substring(6); // Last 7 digits
  const roomId = `jadwa${cleanBookingId}${timestamp}`.toLowerCase();
  const roomPassword = Math.random().toString(36).substring(2, 10);

  // Get or create session
  let session = await prisma.session.findUnique({
    where: { bookingId },
  });

  if (session) {
    session = await prisma.session.update({
      where: { bookingId },
      data: {
        roomId,
        sessionLog: JSON.stringify({
          roomPassword,
          generatedAt: new Date().toISOString(),
          generatedBy: req.userId,
        }),
      },
    });
  } else {
    session = await prisma.session.create({
      data: {
        bookingId,
        sessionType: 'video',
        roomId,
        status: 'SCHEDULED',
        sessionLog: JSON.stringify({
          roomPassword,
          generatedAt: new Date().toISOString(),
          generatedBy: req.userId,
        }),
      },
    });
  }

  // Notify the other party
  const notifyUserId = isConsultant ? booking.client.userId : booking.consultant.userId;
  await createNotification({
    userId: notifyUserId,
    type: 'APPOINTMENT_REMINDER',
    title: 'Video Call Room Ready',
    message: 'The video call room has been created',
    link: `/chat/${bookingId}`,
  });

  res.json({
    message: 'Video room generated successfully',
    room: {
      roomId,
      roomPassword,
      sessionId: session.id,
      joinUrl: `${process.env.VIDEO_SERVICE_URL || 'https://meet.jitsi.si'}/${roomId}`,
    },
    session,
  });
});

/**
 * Get video room details
 */
export const getVideoRoom = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const session = await prisma.session.findUnique({
    where: { bookingId },
    include: {
      booking: {
        include: {
          client: { include: { user: true } },
          consultant: { include: { user: true } },
        },
      },
    },
  });

  if (!session || !session.roomId) {
    return res.status(404).json({ error: 'Video room not found' });
  }

  // Check authorization
  const isConsultant = req.userRole === 'CONSULTANT' && session.booking.consultant.userId === req.userId;
  const isClient = req.userRole === 'CLIENT' && session.booking.client.userId === req.userId;

  if (!isConsultant && !isClient && !['ADMIN', 'SUPER_ADMIN'].includes(req.userRole)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const sessionLog = session.sessionLog ? JSON.parse(session.sessionLog) : {};

  res.json({
    room: {
      roomId: session.roomId,
      roomPassword: sessionLog.roomPassword,
      joinUrl: `${process.env.VIDEO_SERVICE_URL || 'https://meet.jitsi.si'}/${session.roomId}`,
      status: session.status,
    },
    session,
  });
});

/**
 * Delete session (Admin only)
 */
export const deleteSession = asyncHandler(async (req, res) => {
  if (!['ADMIN', 'SUPER_ADMIN'].includes(req.userRole)) {
    return res.status(403).json({ error: 'Only admins can delete sessions' });
  }

  const { sessionId } = req.params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Delete all messages first
  await prisma.message.deleteMany({
    where: { sessionId },
  });

  // Delete session
  await prisma.session.delete({
    where: { id: sessionId },
  });

  res.json({
    message: 'Session deleted successfully',
  });
});

/**
 * Create direct session between admin and any user (Admin only)
 */
export const createDirectSession = asyncHandler(async (req, res) => {
  if (!['ADMIN', 'SUPER_ADMIN'].includes(req.userRole)) {
    return res.status(403).json({ error: 'Only admins can create direct sessions' });
  }

  const { userId, sessionType = 'chat' } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  // Verify target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      client: true,
      consultant: true,
    },
  });

  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if session already exists between admin and this user
  // First, find all direct sessions (without booking) by getting all sessions and filtering
  const allSessions = await prisma.session.findMany({
    include: {
      messages: {
        where: {
          OR: [
            { senderId: req.userId, receiverId: userId },
            { senderId: userId, receiverId: req.userId },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  // Filter to get only direct sessions (without booking) that have messages between these users
  const existingSession = allSessions.find(session => 
    !session.bookingId && session.messages.length > 0
  );

  if (existingSession) {
    return res.json({
      message: 'Session already exists',
      session: existingSession,
    });
  }

  // Create new direct session (without booking)
  // Generate UUID for the session
  const { randomUUID } = await import('crypto');
  const sessionId = randomUUID();
  
  // Use raw SQL to create session without booking relation requirement (MySQL)
  await prisma.$executeRaw`
    INSERT INTO sessions (id, sessionType, status, startTime, createdAt, updatedAt)
    VALUES (${sessionId}, ${sessionType}, 'IN_PROGRESS', NOW(), NOW(), NOW())
  `;
  
  // Fetch the created session with messages using Prisma
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      messages: true,
    },
  });

  // Notify target user
  await createNotification({
    userId: userId,
    type: 'CONSULTANT_RESPONSE',
    title: 'New Direct Message',
    message: `You have a new direct message from admin`,
    link: `/chat/${session.id}`,
  });

  res.status(201).json({
    message: 'Direct session created successfully',
    session,
  });
});

/**
 * Stop session (Admin only)
 */
export const stopSession = asyncHandler(async (req, res) => {
  if (!['ADMIN', 'SUPER_ADMIN'].includes(req.userRole)) {
    return res.status(403).json({ error: 'Only admins can stop sessions' });
  }

  const { sessionId } = req.params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const updatedSession = await prisma.session.update({
    where: { id: sessionId },
    data: {
      status: 'STOPPED',
      endTime: new Date(),
    },
  });

  res.json({
    message: 'Session stopped successfully',
    session: updatedSession,
  });
});


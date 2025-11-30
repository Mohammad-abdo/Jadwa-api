import prisma from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get user notifications
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const { isRead, type, limit = 50 } = req.query;

  const where = { userId: req.userId };
  if (isRead !== undefined) where.isRead = isRead === 'true';
  if (type) where.type = type;

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit),
  });

  // Get unread count
  const unreadCount = await prisma.notification.count({
    where: {
      userId: req.userId,
      isRead: false,
    },
  });

  res.json({
    notifications,
    unreadCount,
  });
});

/**
 * Mark notification as read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.notification.updateMany({
    where: {
      id,
      userId: req.userId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  res.json({ message: 'Notification marked as read' });
});

/**
 * Mark all notifications as read
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: {
      userId: req.userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  res.json({ message: 'All notifications marked as read' });
});

/**
 * Delete notification
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.notification.deleteMany({
    where: {
      id,
      userId: req.userId,
    },
  });

  res.json({ message: 'Notification deleted successfully' });
});

/**
 * Send notification to user (Admin)
 */
export const sendNotification = asyncHandler(async (req, res) => {
  const { userId, type, title, message, link, channel = 'IN_APP', metadata } = req.body;

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
      channel,
      metadata: metadata ? JSON.stringify(metadata) : null,
      sentAt: new Date(),
    },
  });

  res.status(201).json({
    message: 'Notification sent successfully',
    notification,
  });
});

/**
 * Send bulk notifications (Admin)
 */
export const sendBulkNotifications = asyncHandler(async (req, res) => {
  const { userIds, type, title, message, link, channel = 'IN_APP', metadata } = req.body;

  const notifications = await Promise.all(
    userIds.map((userId) =>
      prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          link,
          channel,
          metadata: metadata ? JSON.stringify(metadata) : null,
          sentAt: new Date(),
        },
      })
    )
  );

  res.status(201).json({
    message: `${notifications.length} notifications sent successfully`,
    notifications,
  });
});

/**
 * Get all notifications (Admin)
 */
export const getAllNotifications = asyncHandler(async (req, res) => {
  const { userId, type, channel, isRead, page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (userId) where.userId = userId;
  if (type) where.type = type;
  if (channel) where.channel = channel;
  if (isRead !== undefined) where.isRead = isRead === 'true';

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.notification.count({ where }),
  ]);

  res.json({
    notifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Get notification statistics
 */
export const getNotificationStats = asyncHandler(async (req, res) => {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const [
    totalNotifications,
    unreadNotifications,
    notificationsByType,
    notificationsByChannel,
  ] = await Promise.all([
    prisma.notification.count({
      where: {
        createdAt: { gte: last30Days },
      },
    }),
    prisma.notification.count({
      where: {
        isRead: false,
        createdAt: { gte: last30Days },
      },
    }),
    prisma.notification.groupBy({
      by: ['type'],
      where: {
        createdAt: { gte: last30Days },
      },
      _count: true,
    }),
    prisma.notification.groupBy({
      by: ['channel'],
      where: {
        createdAt: { gte: last30Days },
      },
      _count: true,
    }),
  ]);

  res.json({
    stats: {
      totalNotifications,
      unreadNotifications,
      readNotifications: totalNotifications - unreadNotifications,
    },
    byType: notificationsByType,
    byChannel: notificationsByChannel,
  });
});


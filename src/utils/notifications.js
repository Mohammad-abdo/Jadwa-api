import prisma from '../config/database.js';

/**
 * Create notification
 */
export const createNotification = async (data) => {
  const { userId, type, title, message, link, metadata } = data;

  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
      metadata: metadata ? JSON.stringify(metadata) : null,
      sentAt: new Date(), // Always set sentAt when creating notification
    },
  });
};

/**
 * Create notification for multiple users
 */
export const createBulkNotifications = async (notifications) => {
  return await prisma.notification.createMany({
    data: notifications.map((notif) => ({
      ...notif,
      metadata: notif.metadata ? JSON.stringify(notif.metadata) : null,
    })),
  });
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId, userId) => {
  return await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

/**
 * Mark all notifications as read for user
 */
export const markAllAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};


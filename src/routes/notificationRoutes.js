import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotification,
  sendBulkNotifications,
  getAllNotifications,
  getNotificationStats,
} from '../controllers/notificationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);
router.delete('/:id', authenticate, deleteNotification);

// Admin routes
router.post('/send', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), sendNotification);
router.post('/send-bulk', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), sendBulkNotifications);
router.get('/all', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), getAllNotifications);
router.get('/stats', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), getNotificationStats);

export default router;


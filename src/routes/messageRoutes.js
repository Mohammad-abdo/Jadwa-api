import express from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  sendMessageAsAdmin,
  markMessagesAsRead,
} from '../controllers/messageController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', authenticate, getConversations);
router.get('/session/:sessionId', authenticate, getMessages);
router.post('/session/:sessionId', authenticate, sendMessage);
router.post('/session/:sessionId/admin', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), sendMessageAsAdmin);
router.put('/session/:sessionId/read', authenticate, markMessagesAsRead);

export default router;


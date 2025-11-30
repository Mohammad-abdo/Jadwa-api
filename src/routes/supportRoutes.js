import express from 'express';
import {
  getMyTickets,
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  addComment,
  getTicketStats,
} from '../controllers/supportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.get('/my-tickets', authenticate, getMyTickets);
router.get('/:id', authenticate, getTicketById);
router.post('/', authenticate, createTicket);
router.put('/:id', authenticate, updateTicket);
router.post('/:id/comments', authenticate, addComment);

// Admin/Support routes
router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'SUPPORT'), getAllTickets);
router.get('/stats/overview', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'SUPPORT'), getTicketStats);

export default router;


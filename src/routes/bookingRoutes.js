import express from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  rateBooking,
} from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getBookings);
router.get('/:id', authenticate, getBookingById);
router.post('/', authenticate, authorize('CLIENT'), createBooking);
router.put('/:id/status', authenticate, updateBookingStatus);
router.put('/:id/cancel', authenticate, cancelBooking);
router.post('/:id/rate', authenticate, authorize('CLIENT'), rateBooking);

export default router;


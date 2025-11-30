import express from 'express';
import {
  startSession,
  endSession,
  getSessionByBooking,
  generateVideoRoom,
  getVideoRoom,
} from '../controllers/sessionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/booking/:bookingId', authenticate, getSessionByBooking);
router.post('/booking/:bookingId/start', authenticate, startSession);
router.post('/booking/:bookingId/end', authenticate, endSession);
router.post('/booking/:bookingId/video-room', authenticate, generateVideoRoom);
router.get('/booking/:bookingId/video-room', authenticate, getVideoRoom);

export default router;


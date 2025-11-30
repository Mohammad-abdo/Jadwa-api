import express from 'express';
import {
  getClientDashboardStats,
  getClientBookings,
  getClientConsultations,
} from '../controllers/clientController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and client role
router.use(authenticate);
router.use(authorize('CLIENT'));

router.get('/dashboard/stats', getClientDashboardStats);
router.get('/bookings', getClientBookings);
router.get('/consultations', getClientConsultations);

export default router;


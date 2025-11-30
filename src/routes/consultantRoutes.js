import express from 'express';
import {
  getConsultants,
  getConsultantById,
  getAvailability,
  updateProfile,
  setAvailability,
  getConsultantDashboardStats,
  getEarnings,
  requestWithdrawal,
} from '../controllers/consultantController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes (Consultant only) - MUST come before parameterized routes
router.get('/dashboard/stats', authenticate, authorize('CONSULTANT'), getConsultantDashboardStats);
router.get('/earnings', authenticate, authorize('CONSULTANT'), getEarnings);
router.put('/profile', authenticate, authorize('CONSULTANT'), updateProfile);
router.put('/availability', authenticate, authorize('CONSULTANT'), setAvailability);
router.post('/withdrawals/request', authenticate, authorize('CONSULTANT'), requestWithdrawal);

// Public routes - parameterized routes come last
router.get('/', getConsultants);
router.get('/:id', getConsultantById);
router.get('/:id/availability', getAvailability);

export default router;


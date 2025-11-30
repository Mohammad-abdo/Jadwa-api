import express from 'express';
import {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
} from '../controllers/partnerController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPartners);
router.get('/:id', getPartnerById);

// Admin only routes
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), createPartner);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), updatePartner);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), deletePartner);

export default router;


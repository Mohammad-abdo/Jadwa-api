import express from 'express';
import {
  createPayment,
  updatePaymentStatus,
  getPayments,
  getPaymentById,
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getPayments);
router.get('/:id', authenticate, getPaymentById);
router.post('/', authenticate, createPayment);
router.put('/:id/status', updatePaymentStatus); // Can be called by webhook without auth

export default router;


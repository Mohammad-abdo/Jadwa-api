import express from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), createService);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), updateService);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), deleteService);

export default router;


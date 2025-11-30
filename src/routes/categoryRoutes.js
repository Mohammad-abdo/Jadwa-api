import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Protected routes - Admin only
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), createCategory);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), deleteCategory);

export default router;


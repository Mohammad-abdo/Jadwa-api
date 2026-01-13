import express from 'express';
import {
  getSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,
} from '../controllers/sliderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route - get active sliders
router.get('/', getSliders);

// Admin routes
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), createSlider);
router.get('/:id', getSliderById);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), updateSlider);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), deleteSlider);

export default router;




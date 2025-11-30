import express from 'express';
import {
  getSettings,
  getSetting,
  updateSetting,
  updateSettings,
  getGeneralSettings,
  updateGeneralSettings,
  getPaymentSettings,
  updatePaymentSettings,
  getIntegrationSettings,
  updateIntegrationSettings,
} from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All settings routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

// General routes
router.get('/', getSettings);
router.get('/general', getGeneralSettings);
router.put('/general', updateGeneralSettings);
router.get('/payment', getPaymentSettings);
router.put('/payment', updatePaymentSettings);
router.get('/integration', getIntegrationSettings);
router.put('/integration', updateIntegrationSettings);

// Specific setting routes
router.get('/:key', getSetting);
router.put('/:key', updateSetting);

export default router;


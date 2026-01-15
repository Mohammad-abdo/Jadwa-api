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
  getLegalSettings,
  updateLegalSettings,
} from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/public/legal', getLegalSettings);

// Publicly accessible settings (Authenticated)
router.get('/payment', getPaymentSettings);

// All other settings routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

// General routes
router.get('/', getSettings);
router.get('/general', getGeneralSettings);
router.put('/general', updateGeneralSettings);
router.put('/payment', updatePaymentSettings);
router.get('/integration', getIntegrationSettings);
router.put('/integration', updateIntegrationSettings);
router.get('/legal', getLegalSettings);
router.put('/legal', updateLegalSettings);

// Specific setting routes
router.get('/:key', getSetting);
router.put('/:key', updateSetting);

export default router;


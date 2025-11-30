import express from 'express';
import {
  getSystemLogs,
  getAuditLogs,
  getSecurityStats,
} from '../controllers/monitoringController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/logs/system', getSystemLogs);
router.get('/logs/audit', getAuditLogs);
router.get('/security/stats', getSecurityStats);

export default router;



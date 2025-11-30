import express from 'express';
import {
  getPermissions,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  getUserPermissions,
  initializePermissions,
} from '../controllers/permissionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/permissions', getPermissions);
router.get('/roles', getRoles);
router.post('/roles', createRole);
router.put('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);
router.post('/users/:userId/roles', assignRoleToUser);
router.delete('/users/:userId/roles/:roleId', removeRoleFromUser);
router.get('/users/:userId/permissions', getUserPermissions);
router.post('/initialize', initializePermissions);

export default router;



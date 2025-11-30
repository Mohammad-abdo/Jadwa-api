import express from 'express';
import {
  getDashboardStats,
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getClientById,
  getClientBookings,
  getClientPayments,
  getClientReports,
  sendProfitToClient,
  deductFromClient,
  suspendClient,
  getConsultants,
  createConsultant,
  updateConsultant,
  deleteConsultant,
  getConsultantById,
  getConsultantBookings,
  getConsultantEarnings,
  getConsultantWithdrawals,
  sendProfitToConsultant,
  deductFromConsultant,
  suspendConsultant,
  reviewConsultant,
  getBookings,
  updateBooking,
  deleteBooking,
  getPayments,
  getReports,
  toggleUserStatus,
  resetUserPassword,
  getAllUsers,
} from '../controllers/adminController.js';
import { deleteSession, stopSession, createDirectSession } from '../controllers/sessionController.js';
import { exportReportsCSV, exportReportsPDF, exportPaymentsCSV, generateInvoicePDF } from '../controllers/exportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN', 'ANALYST', 'SUPPORT', 'FINANCE'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/clients', getClients);
router.post('/clients', createClient);
router.get('/clients/:id', getClientById);
router.put('/clients/:id', updateClient);
router.delete('/clients/:id', deleteClient);
router.get('/clients/:id/bookings', getClientBookings);
router.get('/clients/:id/payments', getClientPayments);
router.get('/clients/:id/reports', getClientReports);
router.post('/clients/:id/profit', sendProfitToClient);
router.post('/clients/:id/deduct', deductFromClient);
router.post('/clients/:id/suspend', suspendClient);
router.get('/consultants', getConsultants);
router.post('/consultants', createConsultant);
router.get('/consultants/:id', getConsultantById);
router.put('/consultants/:id', updateConsultant);
router.delete('/consultants/:id', deleteConsultant);
router.get('/consultants/:id/bookings', getConsultantBookings);
router.get('/consultants/:id/earnings', getConsultantEarnings);
router.get('/consultants/:id/withdrawals', getConsultantWithdrawals);
router.post('/consultants/:id/profit', sendProfitToConsultant);
router.post('/consultants/:id/deduct', deductFromConsultant);
router.post('/consultants/:id/suspend', suspendConsultant);
router.put('/consultants/:id/review', reviewConsultant);
router.get('/bookings', getBookings);
router.put('/bookings/:id', updateBooking);
router.delete('/bookings/:id', deleteBooking);
router.get('/payments', getPayments);
router.get('/reports', getReports);
router.get('/reports/export/csv', exportReportsCSV);
router.get('/reports/export/pdf', exportReportsPDF);
router.get('/payments/export/csv', exportPaymentsCSV);
router.get('/payments/:paymentId/invoice', generateInvoicePDF);
router.get('/users', getAllUsers);
router.put('/users/:userId/status', toggleUserStatus);
router.put('/users/:userId/reset-password', resetUserPassword);
router.post('/sessions/direct', createDirectSession);
router.delete('/sessions/:sessionId', deleteSession);
router.put('/sessions/:sessionId/stop', stopSession);

export default router;


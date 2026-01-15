import express from 'express';
import { handleMoyasarWebhook } from '../controllers/paymentController.js';

const router = express.Router();

// Webhooks
router.post('/webhook/moyasar', handleMoyasarWebhook);

export default router;

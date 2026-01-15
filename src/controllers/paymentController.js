import prisma from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createNotification } from '../utils/notifications.js';

/**
 * Handle Moyasar Webhook
 * PERSIST transaction to DB asynchronously
 */
export const handleMoyasarWebhook = asyncHandler(async (req, res) => {
  const paymentData = req.body;

  // Basic validation
  if (!paymentData || !paymentData.id) {
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }

  const { id, status, amount, source, created_at, description, metadata } = paymentData;

  console.log(`Received Moyasar Webhook for Payment ${id}: ${status}`);

  // Map Moyasar status to our Enum
  let paymentStatus = 'PENDING';
  if (status === 'paid') paymentStatus = 'COMPLETED';
  else if (status === 'failed') paymentStatus = 'FAILED';
  else if (status === 'refunded') paymentStatus = 'REFUNDED';

  // Map Payment Method
  let paymentMethod = 'CREDIT_CARD';
  if (source) {
    if (source.type === 'applepay') paymentMethod = 'APPLE_PAY';
    else if (source.type === 'stcpay') paymentMethod = 'STC_PAY';
  }

  // Upsert Payment Record
  // We use upsert because the frontend might have already created it,
  // or this webhook might be a duplicate/update.
  const payment = await prisma.payment.upsert({
    where: { transactionId: id },
    update: {
      status: paymentStatus,
      updatedAt: new Date(),
      gatewayResponse: JSON.stringify(paymentData),
      // If refunded, we might track that here
    },
    create: {
      clientId: metadata?.clientId || 'unknown', // Ideally passed in metadata
      amount: amount / 100, // Moyasar amount is in halalas
      currency: paymentData.currency || 'SAR',
      method: paymentMethod,
      status: paymentStatus,
      transactionId: id,
      gatewayResponse: JSON.stringify(paymentData),
      description: description,
      // We explicitly DO NOT link bookingId here unless we are sure.
      // Usually, the booking creation links the payment.
      // If we have bookingId in metadata, we could try to link it.
      ...(metadata?.bookingId && { bookingId: metadata.bookingId }),
    },
  });

  // If we have a booking associated (either via metadata or previously linked)
  if (payment.bookingId) {
    if (paymentStatus === 'COMPLETED') {
        const booking = await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { 
                paymentStatus: 'COMPLETED',
                status: 'CONFIRMED' // Auto-confirm on payment?
            },
            include: { consultant: true, client: true }
        });

        // Notify Consultant
        await createNotification({
            userId: booking.consultant.userId,
            type: 'PAYMENT_RECEIVED',
            title: 'Payment Received',
            message: `Payment of ${payment.amount} SAR received for booking #${booking.id}`,
            link: `/consultant/bookings/${booking.id}`,
        });
    }
  }

  res.status(200).json({ received: true });
});

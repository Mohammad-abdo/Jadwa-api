import prisma from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Export reports as CSV
 */
export const exportReportsCSV = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const where = {};
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const reports = await prisma.report.findMany({
    where,
    include: {
      consultant: {
        include: { user: true },
      },
      client: {
        include: { user: true },
      },
      booking: {
        include: { service: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Generate CSV content
  const headers = ['Date', 'Client', 'Consultant', 'Service', 'Revenue (SAR)', 'Status'];
  const rows = reports.map((report) => [
    new Date(report.createdAt).toISOString().split('T')[0],
    report.client ? `${report.client.firstName || ''} ${report.client.lastName || ''}`.trim() : 'N/A',
    report.consultant ? `${report.consultant.firstName || ''} ${report.consultant.lastName || ''}`.trim() : 'N/A',
    report.booking?.service?.title || 'N/A',
    report.booking?.totalPrice || report.booking?.price || 0,
    report.status,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=reports-${Date.now()}.csv`);
  res.send(csvContent);
});

/**
 * Export reports as PDF
 * Returns HTML that can be converted to PDF by the browser
 */
export const exportReportsPDF = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const where = {};
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const reports = await prisma.report.findMany({
    where,
    include: {
      consultant: {
        include: { user: true },
      },
      client: {
        include: { user: true },
      },
      booking: {
        include: { service: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate statistics
  const totalRevenue = reports.reduce((sum, r) => sum + (parseFloat(r.booking?.totalPrice || r.booking?.price || 0)), 0);
  const totalReports = reports.length;
  const completedReports = reports.filter((r) => r.status === 'APPROVED').length;

  // Generate HTML for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reports Export</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #1a4d3a; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #1a4d3a; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .summary { margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
        .summary-item { margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>Reports Export</h1>
      <p><strong>Date Range:</strong> ${startDate || 'All time'} to ${endDate || 'All time'}</p>
      
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Client</th>
            <th>Consultant</th>
            <th>Service</th>
            <th>Revenue (SAR)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${reports.map((report) => `
            <tr>
              <td>${new Date(report.createdAt).toISOString().split('T')[0]}</td>
              <td>${report.client ? `${report.client.firstName || ''} ${report.client.lastName || ''}`.trim() : 'N/A'}</td>
              <td>${report.consultant ? `${report.consultant.firstName || ''} ${report.consultant.lastName || ''}`.trim() : 'N/A'}</td>
              <td>${report.booking?.service?.title || 'N/A'}</td>
              <td>${report.booking?.totalPrice || report.booking?.price || 0}</td>
              <td>${report.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="summary">
        <h2>Summary</h2>
        <div class="summary-item"><strong>Total Revenue:</strong> ${totalRevenue} SAR</div>
        <div class="summary-item"><strong>Total Reports:</strong> ${totalReports}</div>
        <div class="summary-item"><strong>Completed Reports:</strong> ${completedReports}</div>
      </div>
    </body>
    </html>
  `;

  // Set headers for PDF download
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', `attachment; filename=reports-${Date.now()}.html`);
  res.send(htmlContent);
});

/**
 * Export payments as CSV
 */
export const exportPaymentsCSV = asyncHandler(async (req, res) => {
  const { startDate, endDate, status } = req.query;

  const where = {};
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }
  if (status) where.status = status;

  const payments = await prisma.payment.findMany({
    where,
    include: {
      booking: {
        include: {
          client: true,
          consultant: true,
          service: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const headers = ['Date', 'Invoice #', 'Client', 'Consultant', 'Service', 'Amount', 'Method', 'Status'];
  const rows = payments.map((payment) => [
    new Date(payment.createdAt).toISOString().split('T')[0],
    payment.invoiceNumber || 'N/A',
    payment.booking?.client ? `${payment.booking.client.firstName} ${payment.booking.client.lastName}` : 'N/A',
    payment.booking?.consultant ? `${payment.booking.consultant.firstName} ${payment.booking.consultant.lastName}` : 'N/A',
    payment.booking?.service?.title || 'N/A',
    payment.amount || 0,
    payment.method || 'N/A',
    payment.status,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=payments-${Date.now()}.csv`);
  res.send(csvContent);
});

/**
 * Generate invoice PDF (returns JSON data for now)
 * In production, use pdfkit or puppeteer to generate actual PDF
 */
export const generateInvoicePDF = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          client: {
            include: { user: true },
          },
          consultant: {
            include: { user: true },
          },
          service: true,
        },
      },
    },
  });

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  // Check authorization
  if (
    req.userRole !== 'ADMIN' &&
    req.userRole !== 'SUPER_ADMIN' &&
    payment.clientId !== req.userId &&
    payment.booking?.consultant?.userId !== req.userId
  ) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Get client data - try from booking first, then fetch directly if needed
  let clientData = null;
  if (payment.booking?.client) {
    clientData = {
      name: `${payment.booking.client.firstName || ''} ${payment.booking.client.lastName || ''}`.trim(),
      email: payment.booking.client.user?.email || null,
      phone: payment.booking.client.user?.phone || null,
    };
  } else if (payment.clientId) {
    // Fallback: fetch client directly if booking is missing
    try {
      const client = await prisma.client.findUnique({
        where: { id: payment.clientId },
        include: { user: { select: { email: true, phone: true } } },
      });
      if (client) {
        clientData = {
          name: `${client.firstName || ''} ${client.lastName || ''}`.trim(),
          email: client.user?.email || null,
          phone: client.user?.phone || null,
        };
      }
    } catch (err) {
      console.error('Error fetching client:', err);
    }
  }

  // Get consultant data - try from booking first, then fetch directly if needed
  let consultantData = null;
  if (payment.booking?.consultant) {
    consultantData = {
      name: `${payment.booking.consultant.firstName || ''} ${payment.booking.consultant.lastName || ''}`.trim(),
      email: payment.booking.consultant.user?.email || null,
      phone: payment.booking.consultant.user?.phone || null,
    };
  } else if (payment.consultantId) {
    // Fallback: fetch consultant directly if booking is missing
    try {
      const consultant = await prisma.consultant.findUnique({
        where: { id: payment.consultantId },
        include: { user: { select: { email: true, phone: true } } },
      });
      if (consultant) {
        consultantData = {
          name: `${consultant.firstName || ''} ${consultant.lastName || ''}`.trim(),
          email: consultant.user?.email || null,
          phone: consultant.user?.phone || null,
        };
      }
    } catch (err) {
      console.error('Error fetching consultant:', err);
    }
  }

  // Get service data - try from booking first
  let serviceData = null;
  if (payment.booking?.service) {
    serviceData = {
      title: payment.booking.service.title || payment.booking.service.titleAr || null,
      titleAr: payment.booking.service.titleAr || null,
      description: payment.booking.service.description || null,
    };
  }

  // Generate invoice data
  const invoiceData = {
    invoiceNumber: payment.invoiceNumber || `INV-${payment.id.substring(0, 8).toUpperCase()}`,
    date: new Date(payment.createdAt).toISOString().split('T')[0],
    paidAt: payment.paidAt ? new Date(payment.paidAt).toISOString().split('T')[0] : null,
    client: clientData,
    consultant: consultantData,
    service: serviceData,
    amount: payment.amount,
    currency: payment.currency || 'SAR',
    method: payment.method,
    status: payment.status,
    transactionId: payment.transactionId,
  };

  // For now, return JSON data that frontend can use to generate PDF
  // In production, use pdfkit or puppeteer to generate actual PDF
  res.json({
    success: true,
    invoice: invoiceData,
  });
});


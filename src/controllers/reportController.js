import prisma from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { createNotification } from "../utils/notifications.js";

/**
 * Get user reports
 */
export const getReports = asyncHandler(async (req, res) => {
  const { status, bookingId } = req.query;
  const where = {};

  if (req.userRole === "CLIENT") {
    const client = await prisma.client.findUnique({
      where: { userId: req.userId },
    });
    if (client) {
      where.clientId = client.id;
    }
  } else if (req.userRole === "CONSULTANT") {
    const consultant = await prisma.consultant.findUnique({
      where: { userId: req.userId },
    });
    if (consultant) {
      where.consultantId = consultant.id;
    }
  }

  if (status) where.status = status;
  if (bookingId) where.bookingId = bookingId;

  const reports = await prisma.report.findMany({
    where,
    include: {
      booking: {
        include: {
          service: true,
        },
      },
      client: {
        include: { user: { select: { email: true } } },
      },
      consultant: {
        include: { 
          user: { select: { email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ reports });
});

/**
 * Get report by ID
 */
export const getReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          service: true,
        },
      },
      client: {
        include: { user: true },
      },
      consultant: {
        include: { user: true },
      },
    },
  });

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  // Check authorization
  let isClient = false;
  let isConsultant = false;

  if (req.userRole === "CLIENT") {
    const client = await prisma.client.findUnique({
      where: { userId: req.userId },
    });
    isClient = client && report.clientId === client.id;
  }

  if (req.userRole === "CONSULTANT") {
    const consultant = await prisma.consultant.findUnique({
      where: { userId: req.userId },
    });
    isConsultant = consultant && report.consultantId === consultant.id;
  }

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(req.userRole);

  if (!isClient && !isConsultant && !isAdmin) {
    return res.status(403).json({ error: "Access denied" });
  }

  res.json({ report });
});

/**
 * Upload report (Consultant only)
 */
export const uploadReport = asyncHandler(async (req, res) => {
  if (req.userRole !== "CONSULTANT") {
    return res
      .status(403)
      .json({ error: "Only consultants can upload reports" });
  }

  const { bookingId, title, reportType, summary, additionalResources } =
    req.body;
  const pdfFile = req.files?.pdf?.[0] || req.file;
  const wordFile = req.files?.word?.[0];
  const pdfUrl = pdfFile ? `/uploads/reports/${pdfFile.filename}` : null;
  const wordUrl = wordFile ? `/uploads/reports/${wordFile.filename}` : null;
  
  // Validate required fields
  if (!bookingId || !title || !reportType || !pdfFile) {
    return res.status(400).json({ error: "Missing required fields: bookingId, title, reportType, and PDF file are required" });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      client: { include: { user: true } },
    },
  });

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  const consultant = await prisma.consultant.findUnique({
    where: { userId: req.userId },
  });

  if (!consultant || booking.consultantId !== consultant.id) {
    return res.status(403).json({ error: "Access denied" });
  }

  // Check if report already exists
  const existingReport = await prisma.report.findUnique({
    where: { bookingId },
  });

  let report;
  if (existingReport) {
    // Update existing report
    report = await prisma.report.update({
      where: { bookingId },
      data: {
        title,
        reportType,
        pdfUrl: pdfUrl || existingReport.pdfUrl,
        wordUrl: wordUrl || existingReport.wordUrl,
        summary,
        additionalResources: additionalResources
          ? JSON.stringify(additionalResources)
          : null,
        status: "UNDER_REVIEW",
      },
    });
  } else {
    // Create new report
    report = await prisma.report.create({
      data: {
        bookingId,
        clientId: booking.clientId,
        consultantId: consultant.id,
        title,
        reportType,
        pdfUrl,
        wordUrl,
        summary,
        additionalResources: additionalResources
          ? JSON.stringify(additionalResources)
          : null,
        status: "UNDER_REVIEW",
      },
    });
  }

  // Update booking
  await prisma.booking.update({
    where: { id: bookingId },
    data: { reportUrl: pdfUrl },
  });

  // Notify client
  await createNotification({
    userId: booking.client.userId,
    type: "REPORT_UPLOADED",
    title: "New Report Available",
    message: "A new report has been uploaded for your consultation",
    link: `/client/reports/${report.id}`,
  });

  res.status(201).json({
    message: "Report uploaded successfully",
    report,
  });
});

/**
 * Approve/Reject report (Admin only)
 */
export const reviewReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  if (!["ADMIN", "SUPER_ADMIN"].includes(req.userRole)) {
    return res.status(403).json({ error: "Only admins can review reports" });
  }

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          client: { include: { user: true } },
        },
      },
    },
  });

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  const updateData = { status };
  if (adminNotes) updateData.adminNotes = adminNotes;
  if (status === "APPROVED") updateData.approvedAt = new Date();

  const updatedReport = await prisma.report.update({
    where: { id },
    data: updateData,
  });

  // Notify client
  await createNotification({
    userId: report.booking.client.userId,
    type: "REPORT_UPLOADED",
    title: `Report ${status}`,
    message: `Your report has been ${status.toLowerCase()}`,
    link: `/client/reports/${report.id}`,
  });

  res.json({
    message: "Report reviewed successfully",
    report: updatedReport,
  });
});

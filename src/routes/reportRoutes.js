import express from 'express';
import {
  getReports,
  getReportById,
  uploadReport,
  reviewReport,
} from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import prisma from '../config/database.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure reports directory exists
const ensureReportsDir = () => {
  const reportsDir = path.join(__dirname, '../../uploads/reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
};

ensureReportsDir();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const reportsDir = path.join(__dirname, '../../uploads/reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    cb(null, reportsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = express.Router();

// Public routes - get approved reports
router.get('/public', async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: {
        status: 'APPROVED',
      },
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
          include: { user: { select: { email: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit to 20 most recent reports
    });
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public route - get single approved report by ID
router.get('/public/:id', async (req, res) => {
  try {
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
          include: { user: { select: { email: true } } },
        },
        consultant: {
          include: { user: { select: { email: true } } },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Only allow public access to approved reports
    if (report.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Report is not publicly available' });
    }

    res.json({ report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected routes
router.get('/', authenticate, getReports);
router.get('/:id', authenticate, getReportById);
router.post('/', authenticate, authorize('CONSULTANT'), upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'word', maxCount: 1 },
]), uploadReport);
router.put('/:id/review', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), reviewReport);

export default router;


import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  uploadFile,
  getFilesByOwner,
  deleteFile,
  downloadFile,
} from '../controllers/fileController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateFile } from '../middleware/validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const ensureUploadDir = (ownerType) => {
  const uploadPath = path.join(__dirname, '../../uploads', ownerType);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const validOwnerTypes = ['USER', 'BOOKING', 'REPORT', 'FEASIBILITY_STUDY', 'ARTICLE', 'TICKET', 'MESSAGE', 'GENERAL', 'SERVICE'];
      let ownerType = 'USER';
      if (req.body.ownerType && req.body.ownerType.trim()) {
        const upperOwnerType = String(req.body.ownerType).trim().toUpperCase();
        if (validOwnerTypes.includes(upperOwnerType)) {
          // Fallback to USER for types that might not be in DB enum yet
          ownerType = (upperOwnerType === 'GENERAL' || upperOwnerType === 'SERVICE') ? 'USER' : upperOwnerType;
        }
      }
      const uploadPath = ensureUploadDir(ownerType);
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // Allow images for ARTICLE uploads
    if (req.body.ownerType === 'ARTICLE') {
      const imageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (imageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for articles'));
      }
    } else {
      // Allow all file types for other uploads
      cb(null, true);
    }
  },
});

const router = express.Router();

router.use(authenticate);

router.post('/upload', upload.single('file'), validateFile({ maxSize: 50 * 1024 * 1024 }), uploadFile);
router.get('/files', getFilesByOwner);
router.get('/files/:id/download', downloadFile);
router.delete('/files/:id', deleteFile);

export default router;

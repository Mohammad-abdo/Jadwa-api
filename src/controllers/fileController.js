import prisma from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import path from 'path';
import fs from 'fs/promises';

/**
 * Upload file
 */
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { ownerType, ownerId, description } = req.body;

  // Validate ownerType is a valid enum value
  // Note: GENERAL and SERVICE might not be in the database enum yet if migration hasn't run
  // So we'll use USER as fallback until migration is complete
  const validOwnerTypes = ['USER', 'BOOKING', 'REPORT', 'FEASIBILITY_STUDY', 'ARTICLE', 'TICKET', 'MESSAGE', 'GENERAL', 'SERVICE'];
  
  // Ensure ownerType is set to a valid value (default to USER if not provided or empty)
  // Handle empty string, null, undefined, or whitespace-only strings
  let finalOwnerType = 'USER';
  const trimmedOwnerType = ownerType ? String(ownerType).trim() : '';
  
    if (trimmedOwnerType && trimmedOwnerType.length > 0) {
    const upperOwnerType = trimmedOwnerType.toUpperCase();
    if (validOwnerTypes.includes(upperOwnerType)) {
      // If GENERAL or SERVICE is requested but might not be in DB yet, fallback to USER
      // This allows the code to work before migration is run
      if (upperOwnerType === 'GENERAL' || upperOwnerType === 'SERVICE') {
        finalOwnerType = 'USER';
      } else {
        finalOwnerType = upperOwnerType;
      }
    } else {
      return res.status(400).json({ error: `Invalid ownerType "${ownerType}". Must be one of: ${validOwnerTypes.join(', ')}` });
    }
  }
  
  // Double-check we have a valid enum value (should never be empty at this point)
  if (!finalOwnerType || finalOwnerType.trim() === '') {
    console.error('❌ CRITICAL: finalOwnerType is empty! ownerType was:', ownerType);
    finalOwnerType = 'USER'; // Force to USER as last resort
  }
  
  console.log('📁 File upload - ownerType:', ownerType, '-> finalOwnerType:', finalOwnerType);

  // Verify file was actually saved to disk using multer's path
  try {
    if (!req.file.path) {
      return res.status(500).json({ error: 'File upload failed: file path not available' });
    }
    await fs.access(req.file.path);
    
    // Log file upload details for debugging
    console.log('✅ File uploaded successfully:', {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      ownerType: finalOwnerType,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('❌ File was not saved to disk:', req.file.path, error);
    return res.status(500).json({ error: 'File upload failed: file was not saved to disk' });
  }

  const fileUrl = `${process.env.API_URL || 'http://localhost:5000'}/uploads/${finalOwnerType}/${req.file.filename}`;
  
  // Double-check file exists before saving to database
  try {
    await fs.access(req.file.path);
  } catch (error) {
    console.error('❌ File disappeared after upload:', req.file.path);
    return res.status(500).json({ error: 'File upload failed: file was not saved correctly' });
  }

  // For ARTICLE type, if ownerId is not provided (new article), use a temporary placeholder
  // The ownerId can be updated later when the article is created
  let finalOwnerId = ownerId;
  if (!finalOwnerId && finalOwnerType === 'ARTICLE') {
    // Use a temporary ID that can be updated later
    finalOwnerId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  } else if (!finalOwnerId) {
    // For other types, use a default placeholder if needed
    finalOwnerId = 'unassigned';
  }

  // Validate userId exists
  if (!req.userId) {
    console.error('❌ No userId in request - authentication may have failed');
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const fileAttachment = await prisma.fileAttachment.create({
      data: {
        ownerType: finalOwnerType,
        ownerId: finalOwnerId,
        fileName: req.file.filename,
        originalFileName: req.file.originalname,
        fileUrl,
        fileType: path.extname(req.file.originalname).substring(1),
        mimeType: req.file.mimetype,
        fileSize: BigInt(req.file.size),
        description,
        uploadedBy: req.userId,
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedFile = {
      ...fileAttachment,
      fileSize: fileAttachment.fileSize.toString(),
    };

    res.status(201).json({
      message: 'File uploaded successfully',
      file: serializedFile,
    });
  } catch (error) {
    console.error('❌ Database error creating file attachment:', error);
    // If file was saved but DB insert failed, try to clean up the file
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.error('Failed to clean up file:', unlinkError);
    }
    throw error; // Let asyncHandler handle it
  }
});

/**
 * Get files by owner
 */
export const getFilesByOwner = asyncHandler(async (req, res) => {
  const { ownerType, ownerId } = req.query;

  const files = await prisma.fileAttachment.findMany({
    where: {
      ownerType,
      ownerId,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Convert BigInt to string for JSON serialization
  const serializedFiles = files.map(file => ({
    ...file,
    fileSize: file.fileSize.toString(),
  }));

  res.json({ files: serializedFiles });
});

/**
 * Delete file
 */
export const deleteFile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const file = await prisma.fileAttachment.findUnique({
    where: { id },
  });

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Check permission (owner or admin)
  if (file.uploadedBy !== req.userId && !['ADMIN', 'SUPER_ADMIN'].includes(req.userRole || '')) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Delete physical file
  try {
    const filePath = path.join(process.cwd(), 'uploads', file.ownerType, file.fileName);
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
    // Continue with database deletion even if file doesn't exist
  }

  // Delete database record
  await prisma.fileAttachment.delete({
    where: { id },
  });

  res.json({ message: 'File deleted successfully' });
});

/**
 * Download file
 */
export const downloadFile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const file = await prisma.fileAttachment.findUnique({
    where: { id },
  });

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Check permission
  if (!file.isPublic && file.uploadedBy !== req.userId && !['ADMIN', 'SUPER_ADMIN'].includes(req.userRole || '')) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Update download count
  await prisma.fileAttachment.update({
    where: { id },
    data: {
      downloadCount: { increment: 1 },
    },
  });

  const filePath = path.join(process.cwd(), 'uploads', file.ownerType, file.fileName);
  
  res.download(filePath, file.originalFileName, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).json({ error: 'Error downloading file' });
    }
  });
});


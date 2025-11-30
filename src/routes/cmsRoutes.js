import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import prisma from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all CMS pages (public, only published)
router.get('/', asyncHandler(async (req, res) => {
  const { isPublished = true } = req.query;

  const pages = await prisma.cMSPage.findMany({
    where: {
      isPublished: isPublished === 'true' || isPublished === true,
    },
    orderBy: { order: 'asc' },
  });

  res.json({ pages });
}));

// Get page by slug
router.get('/:slug', asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const page = await prisma.cMSPage.findUnique({
    where: { slug },
  });

  if (!page || !page.isPublished) {
    return res.status(404).json({ error: 'Page not found' });
  }

  res.json({ page });
}));

// Create page (Admin only)
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(async (req, res) => {
  const {
    title,
    titleAr,
    slug,
    content,
    contentAr,
    metaTitle,
    metaDescription,
    isPublished = false,
    order = 0,
  } = req.body;

  const page = await prisma.cMSPage.create({
    data: {
      title,
      titleAr,
      slug,
      content,
      contentAr,
      metaTitle,
      metaDescription,
      isPublished,
      order: parseInt(order),
    },
  });

  res.status(201).json({
    message: 'Page created successfully',
    page,
  });
}));

// Update page (Admin only)
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (updateData.order) {
    updateData.order = parseInt(updateData.order);
  }

  const page = await prisma.cMSPage.update({
    where: { id },
    data: updateData,
  });

  res.json({
    message: 'Page updated successfully',
    page,
  });
}));

// Delete page (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.cMSPage.delete({
    where: { id },
  });

  res.json({ message: 'Page deleted successfully' });
}));

export default router;


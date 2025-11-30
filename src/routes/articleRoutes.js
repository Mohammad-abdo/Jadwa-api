import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import prisma from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all articles (public)
router.get('/', asyncHandler(async (req, res) => {
  const { status = 'PUBLISHED', category, search } = req.query;
  const where = {};

  // Handle status filter - if 'all' or undefined/null, don't filter by status
  if (status && status !== 'all' && status !== 'undefined' && status !== 'null') {
    where.status = status;
  }

  if (category) where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const articles = await prisma.article.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
  });

  res.json({ articles });
}));

// Get article by ID (for editing)
router.get('/id/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }

  res.json({ article });
}));

// Get article by slug
router.get('/:slug', asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }

  // Increment views
  await prisma.article.update({
    where: { slug },
    data: { views: { increment: 1 } },
  });

  res.json({ article });
}));

// Create article (Admin only)
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(async (req, res) => {
  const {
    title,
    titleAr,
    content,
    contentAr,
    excerpt,
    excerptAr,
    category,
    featuredImage,
    images,
    tags,
    status = 'DRAFT',
  } = req.body;

  // Generate unique slug
  let baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  let slug = baseSlug;
  let counter = 1;

  // Check if slug already exists and append number if needed
  while (true) {
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
    });

    if (!existingArticle) {
      break; // Slug is unique, we can use it
    }

    // Slug exists, append a number
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const article = await prisma.article.create({
    data: {
      authorId: req.userId,
      title,
      titleAr,
      slug,
      content,
      contentAr,
      excerpt,
      excerptAr,
      category,
      featuredImage: req.body.featuredImage || null,
      images: req.body.images && req.body.images !== '[]' && req.body.images !== '' 
        ? (typeof req.body.images === 'string' ? req.body.images : JSON.stringify(req.body.images)) 
        : null,
      tags: tags ? (Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify(tags.split(',').map(t => t.trim()))) : null,
      status,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    },
  });

  res.status(201).json({
    message: 'Article created successfully',
    article,
  });
}));

// Update article (Admin only)
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (updateData.tags) {
    updateData.tags = Array.isArray(updateData.tags) 
      ? JSON.stringify(updateData.tags) 
      : JSON.stringify(updateData.tags.split(',').map(t => t.trim()));
  }

  if (updateData.images !== undefined) {
    if (updateData.images === null || updateData.images === '' || updateData.images === '[]') {
      updateData.images = null;
    } else {
      updateData.images = typeof updateData.images === 'string' 
        ? updateData.images 
        : JSON.stringify(updateData.images);
    }
  }

  if (updateData.status === 'PUBLISHED' && !updateData.publishedAt) {
    updateData.publishedAt = new Date();
  }

  const article = await prisma.article.update({
    where: { id },
    data: updateData,
  });

  res.json({
    message: 'Article updated successfully',
    article,
  });
}));

// Delete article (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.article.delete({
    where: { id },
  });

  res.json({ message: 'Article deleted successfully' });
}));

export default router;


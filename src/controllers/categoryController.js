import prisma from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all categories
 */
export const getCategories = asyncHandler(async (req, res) => {
  const { isActive, parentId } = req.query;

  const where = {};
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }
  if (parentId !== undefined) {
    where.parentId = parentId === 'null' ? null : parentId;
  }

  const categories = await prisma.category.findMany({
    where,
    include: {
      parent: true,
      children: true,
      _count: {
        select: {
          consultants: true,
          services: true,
          articles: true,
        },
      },
    },
    orderBy: [
      { order: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  res.json({ categories });
});

/**
 * Get category by ID
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
      _count: {
        select: {
          consultants: true,
          services: true,
          articles: true,
        },
      },
    },
  });

  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  res.json({ category });
});

/**
 * Create category
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, nameAr, slug, description, descriptionAr, icon, color, isActive, order, parentId } = req.body;

  // Validate required fields
  if (!name || !slug) {
    return res.status(400).json({ error: 'Name and slug are required' });
  }

  // Check if slug already exists
  const existingCategory = await prisma.category.findUnique({
    where: { slug },
  });

  if (existingCategory) {
    return res.status(409).json({ error: 'Category with this slug already exists' });
  }

  // Generate slug from name if not provided
  let finalSlug = slug;
  if (!finalSlug) {
    finalSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Ensure uniqueness
    let uniqueSlug = finalSlug;
    let counter = 1;
    while (await prisma.category.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${finalSlug}-${counter}`;
      counter++;
    }
    finalSlug = uniqueSlug;
  }

  const category = await prisma.category.create({
    data: {
      name,
      nameAr,
      slug: finalSlug,
      description,
      descriptionAr,
      icon,
      color,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
      parentId: parentId || null,
    },
    include: {
      parent: true,
      children: true,
    },
  });

  res.status(201).json({
    message: 'Category created successfully',
    category,
  });
});

/**
 * Update category
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, nameAr, slug, description, descriptionAr, icon, color, isActive, order, parentId } = req.body;

  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    return res.status(404).json({ error: 'Category not found' });
  }

  // Check slug uniqueness if slug is being changed
  if (slug && slug !== existingCategory.slug) {
    const slugExists = await prisma.category.findUnique({
      where: { slug },
    });

    if (slugExists) {
      return res.status(409).json({ error: 'Category with this slug already exists' });
    }
  }

  // Prevent circular reference (category cannot be its own parent)
  if (parentId === id) {
    return res.status(400).json({ error: 'Category cannot be its own parent' });
  }

  // Check if parentId would create a circular reference
  if (parentId) {
    const checkCircular = async (categoryId, targetParentId) => {
      if (categoryId === targetParentId) return true;
      const parent = await prisma.category.findUnique({
        where: { id: targetParentId },
        select: { parentId: true },
      });
      if (!parent || !parent.parentId) return false;
      return checkCircular(categoryId, parent.parentId);
    };

    const wouldBeCircular = await checkCircular(id, parentId);
    if (wouldBeCircular) {
      return res.status(400).json({ error: 'Cannot set parent: would create circular reference' });
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(nameAr !== undefined && { nameAr }),
      ...(slug && { slug }),
      ...(description !== undefined && { description }),
      ...(descriptionAr !== undefined && { descriptionAr }),
      ...(icon !== undefined && { icon }),
      ...(color !== undefined && { color }),
      ...(isActive !== undefined && { isActive }),
      ...(order !== undefined && { order }),
      ...(parentId !== undefined && { parentId: parentId || null }),
    },
    include: {
      parent: true,
      children: true,
    },
  });

  res.json({
    message: 'Category updated successfully',
    category,
  });
});

/**
 * Delete category
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          consultants: true,
          services: true,
          articles: true,
          children: true,
        },
      },
    },
  });

  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  // Check if category has children
  if (category._count.children > 0) {
    return res.status(400).json({ 
      error: 'Cannot delete category with child categories. Please delete or reassign children first.' 
    });
  }

  // Check if category is in use
  const totalUsage = category._count.consultants + category._count.services + category._count.articles;
  if (totalUsage > 0) {
    return res.status(400).json({ 
      error: `Cannot delete category: it is being used by ${totalUsage} item(s). Please reassign them first.` 
    });
  }

  await prisma.category.delete({
    where: { id },
  });

  res.json({ message: 'Category deleted successfully' });
});


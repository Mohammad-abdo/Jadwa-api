import prisma from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all services
 */
export const getServices = asyncHandler(async (req, res) => {
  const { category, status, search } = req.query;

  const where = {};
  if (category) where.category = category;
  if (status === 'active') where.status = 'ACTIVE';
  if (status === 'inactive') where.status = 'INACTIVE';
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { titleAr: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const services = await prisma.service.findMany({
    where,
    orderBy: { order: 'asc' },
  });

  res.json({ services });
});

/**
 * Get service by ID
 */
export const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  res.json({ service });
});

/**
 * Create service (Admin only)
 */
export const createService = asyncHandler(async (req, res) => {
  const {
    title,
    titleAr,
    description,
    descriptionAr,
    category,
    targetAudience,
    type,
    price,
    icon,
    image,
    status = 'ACTIVE',
    order = 0,
  } = req.body;

  // Validate category is a valid ServiceCategory enum
  const validCategories = ['ECONOMIC', 'ADMINISTRATIVE', 'FINANCIAL_ACCOUNTING', 'ANALYSIS_REPORTS', 'FIELD_SURVEY', 'DIGITAL_CUSTOMER'];
  if (category && !validCategories.includes(category)) {
    return res.status(400).json({ 
      error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
    });
  }

  const service = await prisma.service.create({
    data: {
      title,
      titleAr,
      description,
      descriptionAr,
      category: category || 'ECONOMIC', // Default to ECONOMIC if not provided
      targetAudience,
      type,
      price: price ? parseFloat(price) : null,
      icon,
      image,
      status: status || 'ACTIVE',
      order: parseInt(order) || 0,
    },
  });

  res.status(201).json({
    message: 'Service created successfully',
    service,
  });
});

/**
 * Update service (Admin only)
 */
export const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (updateData.price) updateData.price = parseFloat(updateData.price);
  if (updateData.order) updateData.order = parseInt(updateData.order);

  const service = await prisma.service.update({
    where: { id },
    data: updateData,
  });

  res.json({
    message: 'Service updated successfully',
    service,
  });
});

/**
 * Delete service (Admin only)
 */
export const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.service.delete({
    where: { id },
  });

  res.json({ message: 'Service deleted successfully' });
});


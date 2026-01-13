import prisma from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all partners
 */
export const getPartners = asyncHandler(async (req, res) => {
  const { isActive } = req.query;

  const where = {};
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const partners = await prisma.partner.findMany({
    where,
    orderBy: [
      { order: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  res.json({
    success: true,
    partners,
  });
});

/**
 * Get partner by ID
 */
export const getPartnerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const partner = await prisma.partner.findUnique({
    where: { id },
  });

  if (!partner) {
    return res.status(404).json({
      success: false,
      message: 'Partner not found',
    });
  }

  res.json({
    success: true,
    partner,
  });
});

/**
 * Create partner (Admin only)
 */
export const createPartner = asyncHandler(async (req, res) => {
  const { name, nameAr, logo, website, description, descriptionAr, isActive, order } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Partner name is required',
    });
  }

  const partner = await prisma.partner.create({
    data: {
      name,
      nameAr,
      logo,
      website,
      description,
      descriptionAr,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Partner created successfully',
    partner,
  });
});

/**
 * Update partner (Admin only)
 */
export const updatePartner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, nameAr, logo, website, description, descriptionAr, isActive, order } = req.body;

  const existingPartner = await prisma.partner.findUnique({
    where: { id },
  });

  if (!existingPartner) {
    return res.status(404).json({
      success: false,
      message: 'Partner not found',
    });
  }

  const partner = await prisma.partner.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(nameAr !== undefined && { nameAr }),
      ...(logo !== undefined && { logo: logo || null }), // Convert empty string to null
      ...(website !== undefined && { website }),
      ...(description !== undefined && { description }),
      ...(descriptionAr !== undefined && { descriptionAr }),
      ...(isActive !== undefined && { isActive }),
      ...(order !== undefined && { order }),
    },
  });

  res.json({
    success: true,
    message: 'Partner updated successfully',
    partner,
  });
});

/**
 * Delete partner (Admin only)
 */
export const deletePartner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingPartner = await prisma.partner.findUnique({
    where: { id },
  });

  if (!existingPartner) {
    return res.status(404).json({
      success: false,
      message: 'Partner not found',
    });
  }

  await prisma.partner.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Partner deleted successfully',
  });
});


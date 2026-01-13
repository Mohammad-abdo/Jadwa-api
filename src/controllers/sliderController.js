import { asyncHandler } from '../middleware/errorHandler.js';
import prisma from '../config/database.js';

// @desc    Get all sliders (active only for public)
// @route   GET /api/sliders
// @access  Public
export const getSliders = asyncHandler(async (req, res) => {
  const { isActive } = req.query;

  const where = {};
  // If not admin, only return active sliders
  if (!req.user || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    where.isActive = true;
  } else if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const sliders = await prisma.slider.findMany({
    where,
    orderBy: [
      { order: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  res.json({ sliders });
});

// @desc    Get single slider
// @route   GET /api/sliders/:id
// @access  Public
export const getSliderById = asyncHandler(async (req, res) => {
  const slider = await prisma.slider.findUnique({
    where: { id: req.params.id },
  });

  if (!slider) {
    return res.status(404).json({ message: 'Slider not found' });
  }

  res.json({ slider });
});

// @desc    Create slider
// @route   POST /api/sliders
// @access  Admin
export const createSlider = asyncHandler(async (req, res) => {
  const {
    title,
    titleAr,
    subtitle,
    subtitleAr,
    description,
    descriptionAr,
    image,
    icon,
    buttonText,
    buttonTextAr,
    buttonLink,
    isActive,
    order,
  } = req.body;

  const slider = await prisma.slider.create({
    data: {
      title,
      titleAr,
      subtitle,
      subtitleAr,
      description,
      descriptionAr,
      image,
      icon,
      buttonText,
      buttonTextAr,
      buttonLink,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    },
  });

  res.status(201).json({ slider });
});

// @desc    Update slider
// @route   PUT /api/sliders/:id
// @access  Admin
export const updateSlider = asyncHandler(async (req, res) => {
  const {
    title,
    titleAr,
    subtitle,
    subtitleAr,
    description,
    descriptionAr,
    image,
    icon,
    buttonText,
    buttonTextAr,
    buttonLink,
    isActive,
    order,
  } = req.body;

  const slider = await prisma.slider.update({
    where: { id: req.params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(titleAr !== undefined && { titleAr }),
      ...(subtitle !== undefined && { subtitle }),
      ...(subtitleAr !== undefined && { subtitleAr }),
      ...(description !== undefined && { description }),
      ...(descriptionAr !== undefined && { descriptionAr }),
      ...(image !== undefined && { image }),
      ...(icon !== undefined && { icon }),
      ...(buttonText !== undefined && { buttonText }),
      ...(buttonTextAr !== undefined && { buttonTextAr }),
      ...(buttonLink !== undefined && { buttonLink }),
      ...(isActive !== undefined && { isActive }),
      ...(order !== undefined && { order }),
    },
  });

  res.json({ slider });
});

// @desc    Delete slider
// @route   DELETE /api/sliders/:id
// @access  Admin
export const deleteSlider = asyncHandler(async (req, res) => {
  await prisma.slider.delete({
    where: { id: req.params.id },
  });

  res.json({ message: 'Slider deleted successfully' });
});


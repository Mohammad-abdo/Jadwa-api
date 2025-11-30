import prisma from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get client dashboard statistics
 */
export const getClientDashboardStats = asyncHandler(async (req, res) => {
  const client = await prisma.client.findUnique({
    where: { userId: req.userId },
  });

  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  const [
    totalBookings,
    pendingBookings,
    completedBookings,
    totalSpent,
    upcomingBookings,
    recentBookings,
  ] = await Promise.all([
    prisma.booking.count({
      where: { clientId: client.id },
    }),
    prisma.booking.count({
      where: {
        clientId: client.id,
        status: 'PENDING',
      },
    }),
    prisma.booking.count({
      where: {
        clientId: client.id,
        status: 'COMPLETED',
      },
    }),
    prisma.payment.aggregate({
      where: {
        clientId: req.userId, // Payment.clientId is User ID
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    }),
    prisma.booking.findMany({
      where: {
        clientId: client.id,
        status: { in: ['PENDING', 'CONFIRMED'] },
        scheduledAt: { gte: new Date() },
      },
      include: {
        consultant: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        service: {
          select: {
            title: true,
            titleAr: true,
            icon: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { clientId: client.id },
      include: {
        consultant: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        service: {
          select: {
            title: true,
            titleAr: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  res.json({
    stats: {
      totalBookings,
      pendingBookings,
      completedBookings,
      totalSpent: totalSpent._sum.amount || 0,
    },
    upcomingBookings,
    recentBookings,
  });
});

/**
 * Get client bookings
 */
export const getClientBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const client = await prisma.client.findUnique({
    where: { userId: req.userId },
  });

  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  const where = { clientId: client.id };
  if (status) where.status = status;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        consultant: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        service: {
          select: {
            title: true,
            titleAr: true,
            icon: true,
          },
        },
        payment: {
          select: {
            status: true,
            amount: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.booking.count({ where }),
  ]);

  res.json({
    bookings,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Get client consultations
 */
export const getClientConsultations = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const client = await prisma.client.findUnique({
    where: { userId: req.userId },
  });

  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  const where = {
    clientId: client.id,
    status: { in: ['CONFIRMED', 'COMPLETED'] },
  };
  if (status) where.status = status;

  const consultations = await prisma.booking.findMany({
    where,
    include: {
      consultant: {
        include: {
          user: {
            select: {
              email: true,
              phone: true,
              avatar: true,
            },
          },
        },
      },
      service: true,
      session: {
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
      report: {
        select: {
          id: true,
          title: true,
          status: true,
          pdfUrl: true,
          createdAt: true,
        },
      },
    },
    orderBy: { scheduledAt: 'desc' },
  });

  res.json({ consultations });
});


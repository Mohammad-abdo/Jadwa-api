import prisma from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { hashPassword } from "../utils/password.js";
import {
  createNotification,
  createBulkNotifications,
} from "../utils/notifications.js";

/**
 * Get dashboard statistics
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const [
    activeClients,
    totalClients,
    activeConsultants,
    totalConsultants,
    completedSessions,
    totalSessions,
    pendingSessions,
    confirmedSessions,
    monthlyRevenue,
    totalRevenue,
    lastMonthRevenue,
    averageRating,
    totalRatings,
    cancelledSessions,
    totalBookings,
    totalServices,
    activeServices,
    totalArticles,
    publishedArticles,
    totalPayments,
    pendingPayments,
    totalReports,
    recentBookings,
    revenueByMonth,
    sessionsByStatus,
    topConsultants,
  ] = await Promise.all([
    // Active clients
    prisma.client.count({
      where: {
        user: { isActive: true },
      },
    }),
    // Total clients
    prisma.client.count(),
    // Active consultants
    prisma.consultant.count({
      where: {
        isAvailable: true,
        user: { isActive: true },
      },
    }),
    // Total consultants
    prisma.consultant.count(),
    // Completed sessions this month
    prisma.booking.count({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: thisMonthStart,
        },
      },
    }),
    // Total sessions
    prisma.booking.count(),
    // Pending sessions
    prisma.booking.count({
      where: {
        status: "PENDING",
      },
    }),
    // Confirmed sessions
    prisma.booking.count({
      where: {
        status: "CONFIRMED",
      },
    }),
    // Monthly revenue
    prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: thisMonthStart,
        },
      },
      _sum: { amount: true },
    }),
    // Total revenue
    prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
      },
      _sum: { amount: true },
    }),
    // Last month revenue
    prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
      _sum: { amount: true },
    }),
    // Average rating
    prisma.booking.aggregate({
      where: {
        rating: { not: null },
      },
      _avg: { rating: true },
    }),
    // Total ratings count
    prisma.booking.count({
      where: {
        rating: { not: null },
      },
    }),
    // Cancelled sessions this month
    prisma.booking.count({
      where: {
        status: "CANCELLED",
        createdAt: {
          gte: thisMonthStart,
        },
      },
    }),
    // Total bookings
    prisma.booking.count(),
    // Total services
    prisma.service.count(),
    // Active services
    prisma.service.count({
      where: {
        status: "ACTIVE",
      },
    }),
    // Total articles
    prisma.article.count(),
    // Published articles
    prisma.article.count({
      where: {
        status: "PUBLISHED",
      },
    }),
    // Total payments
    prisma.payment.count(),
    // Pending payments
    prisma.payment.count({
      where: {
        status: "PENDING",
      },
    }),
    // Total reports
    prisma.report.count(),
    // Recent bookings (last 10)
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        consultant: {
          include: {
            user: {
              select: {
                email: true,
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
    }),
    // Revenue by month (last 6 months) - fetch all and group manually
    prisma.payment.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    }),
    // Sessions by status
    prisma.booking.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    }),
    // Top consultants by bookings
    prisma.booking.groupBy({
      by: ["consultantId"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 5,
    }),
  ]);

  // Process revenue by month data
  const monthlyRevenueData = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthRevenue = revenueByMonth
      .filter((r) => {
        const rDate = new Date(r.createdAt);
        return (
          rDate.getMonth() === monthDate.getMonth() &&
          rDate.getFullYear() === monthDate.getFullYear()
        );
      })
      .reduce((sum, r) => sum + (r.amount || 0), 0);
    monthlyRevenueData.push({
      month: monthDate.toLocaleDateString("en-US", { month: "short" }),
      revenue: monthRevenue,
    });
  }

  // Get top consultants details
  const topConsultantsData = await Promise.all(
    topConsultants.map(async (tc) => {
      if (!tc.consultantId) return null;
      const consultant = await prisma.consultant.findUnique({
        where: { id: tc.consultantId },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });
      return consultant
        ? {
            id: consultant.id,
            name: `${consultant.firstName} ${consultant.lastName}`,
            email: consultant.user.email,
            bookings: tc._count.id,
            rating: consultant.rating || 0,
          }
        : null;
    })
  );

  res.json({
    stats: {
      activeClients,
      totalClients,
      activeConsultants,
      totalConsultants,
      completedSessions,
      totalSessions,
      pendingSessions,
      confirmedSessions,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      totalRevenue: totalRevenue._sum.amount || 0,
      lastMonthRevenue: lastMonthRevenue._sum.amount || 0,
      revenueGrowth:
        lastMonthRevenue._sum.amount > 0
          ? ((monthlyRevenue._sum.amount - lastMonthRevenue._sum.amount) /
              lastMonthRevenue._sum.amount) *
            100
          : 0,
      averageRating: averageRating._avg.rating || 0,
      totalRatings,
      cancelledSessions,
      totalBookings,
      totalServices,
      activeServices,
      totalArticles,
      publishedArticles,
      totalPayments,
      pendingPayments,
      totalReports,
      monthlyRevenueData,
      sessionsByStatus: sessionsByStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      topConsultants: topConsultantsData.filter((c) => c !== null),
      recentBookings: recentBookings.map((b) => ({
        id: b.id,
        clientName: b.client
          ? `${b.client.firstName} ${b.client.lastName}`
          : "N/A",
        consultantName: b.consultant
          ? `${b.consultant.firstName} ${b.consultant.lastName}`
          : "N/A",
        serviceName: b.service ? b.service.title || b.service.titleAr : "N/A",
        status: b.status,
        scheduledAt: b.scheduledAt,
        createdAt: b.createdAt,
      })),
    },
  });
});

/**
 * Get all clients
 */
export const getClients = asyncHandler(async (req, res) => {
  const { search, status } = req.query;

  const where = {};
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { user: { email: { contains: search } } },
    ];
  }

  if (status === "active") {
    where.user = { isActive: true };
  } else if (status === "inactive") {
    where.user = { isActive: false };
  }

  const clients = await prisma.client.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          isActive: true,
          lastLogin: true,
        },
      },
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ clients });
});

/**
 * Get all consultants
 */
export const getConsultants = asyncHandler(async (req, res) => {
  const { search, status } = req.query;

  const where = {};
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { user: { email: { contains: search } } },
    ];
  }

  if (status === "approved") {
    where.isVerified = true;
  } else if (status === "pending") {
    where.isVerified = false;
  }

  const consultants = await prisma.consultant.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          isActive: true,
        },
      },
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ consultants });
});

/**
 * Approve/Reject consultant
 */
export const reviewConsultant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'approve' or 'reject'

  const consultant = await prisma.consultant.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!consultant) {
    return res.status(404).json({ error: "Consultant not found" });
  }

  const updatedConsultant = await prisma.consultant.update({
    where: { id },
    data: {
      isVerified: action === "approve",
    },
  });

  res.json({
    message: `Consultant ${action}d successfully`,
    consultant: updatedConsultant,
  });
});

/**
 * Suspend/Activate user
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });

  res.json({
    message: `User ${isActive ? "activated" : "suspended"} successfully`,
    user,
  });
});

/**
 * Reset user password
 */
export const getReports = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const where = {};
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  // Get reports data
  const reports = await prisma.report.findMany({
    where,
    include: {
      consultant: {
        include: { user: true },
      },
      client: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate statistics
  const totalClients = await prisma.client.count({
    where: { user: { isActive: true } },
  });

  const avgRating = await prisma.booking.aggregate({
    where: { rating: { not: null } },
    _avg: { rating: true },
  });

  // Format reports for frontend
  const formattedReports = reports.map((report) => ({
    id: report.id,
    date: report.createdAt,
    revenue: report.price || 0,
    sessions: 1,
    clients: 1,
  }));

  res.json({
    reports: formattedReports,
    stats: {
      totalClients,
      averageRating: avgRating._avg.rating || 0,
    },
  });
});

/**
 * Get all users (Admin only)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { search, role, isActive } = req.query;

  const where = {};
  if (search) {
    where.OR = [
      { email: { contains: search } },
      { phone: { contains: search } },
      {
        client: {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
          ],
        },
      },
      {
        consultant: {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
          ],
        },
      },
    ];
  }
  if (role) {
    where.role = role;
  }
  if (isActive !== undefined) {
    where.isActive = isActive === "true";
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      consultant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ users });
});

export const resetUserPassword = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  res.json({ message: "Password reset successfully" });
});

/**
 * Get client by ID with full details
 */
export const getClientById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          avatar: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
        },
      },
    },
  });

  if (!client) {
    return res.status(404).json({ error: "Client not found" });
  }

  res.json({ client });
});

/**
 * Get client bookings
 */
export const getClientBookings = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bookings = await prisma.booking.findMany({
    where: { clientId: id },
    include: {
      consultant: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      service: {
        select: {
          title: true,
          titleAr: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedBookings = bookings.map((b) => ({
    id: b.id,
    scheduledAt: b.scheduledAt,
    consultantName: b.consultant
      ? `${b.consultant.firstName} ${b.consultant.lastName}`
      : "N/A",
    serviceName: b.service ? b.service.title || b.service.titleAr : "N/A",
    status: b.status,
    price: b.price,
  }));

  res.json({ bookings: formattedBookings });
});

/**
 * Get client payments
 */
export const getClientPayments = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const client = await prisma.client.findUnique({
    where: { id },
  });

  if (!client) {
    return res.status(404).json({ error: "Client not found" });
  }

  const payments = await prisma.payment.findMany({
    where: { clientId: id },
    include: {
      booking: {
        include: {
          service: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ payments });
});

/**
 * Get client reports
 */
export const getClientReports = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const reports = await prisma.report.findMany({
    where: { clientId: id },
    orderBy: { createdAt: "desc" },
  });

  res.json({ reports });
});

/**
 * Send profit to client
 * NOTE: Admin should only send profits to consultants, not clients
 * Clients receive payments through bookings
 */
export const sendProfitToClient = asyncHandler(async (req, res) => {
  return res.status(403).json({
    error:
      "Admin can only send profits to consultants. Clients receive payments through bookings.",
  });
});

/**
 * Deduct from client
 */
export const deductFromClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, reason } = req.body;

  const client = await prisma.client.findUnique({
    where: { id },
  });

  if (!client) {
    return res.status(404).json({ error: "Client not found" });
  }

  // Create a payment record for the deduction
  const payment = await prisma.payment.create({
    data: {
      clientId: id,
      amount: -parseFloat(amount), // Negative amount for deduction
      currency: "SAR",
      method: "BANK_TRANSFER",
      status: "COMPLETED",
      paidAt: new Date(),
    },
  });

  res.json({
    message: "Amount deducted successfully",
    payment,
  });
});

/**
 * Suspend client account
 */
export const suspendClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, duration } = req.body;

  const client = await prisma.client.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!client) {
    return res.status(404).json({ error: "Client not found" });
  }

  await prisma.user.update({
    where: { id: client.userId },
    data: { isActive: false },
  });

  res.json({
    message: "Client account suspended successfully",
  });
});

/**
 * Get consultant by ID with full details
 */
export const getConsultantById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const consultant = await prisma.consultant.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          avatar: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
        },
      },
    },
  });

  if (!consultant) {
    return res.status(404).json({ error: "Consultant not found" });
  }

  res.json({ consultant });
});

/**
 * Get consultant bookings
 */
export const getConsultantBookings = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bookings = await prisma.booking.findMany({
    where: { consultantId: id },
    include: {
      client: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      service: {
        select: {
          title: true,
          titleAr: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedBookings = bookings.map((b) => ({
    id: b.id,
    scheduledAt: b.scheduledAt,
    clientName: b.client ? `${b.client.firstName} ${b.client.lastName}` : "N/A",
    serviceName: b.service ? b.service.title || b.service.titleAr : "N/A",
    status: b.status,
    price: b.price,
  }));

  res.json({ bookings: formattedBookings });
});

/**
 * Get consultant earnings
 */
export const getConsultantEarnings = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const earnings = await prisma.earning.findMany({
    where: { consultantId: id },
    include: {
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ earnings });
});

/**
 * Get consultant withdrawals
 */
export const getConsultantWithdrawals = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const withdrawals = await prisma.withdrawal.findMany({
    where: { consultantId: id },
    orderBy: { createdAt: "desc" },
  });

  res.json({ withdrawals });
});

/**
 * Send profit to consultant
 */
export const sendProfitToConsultant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, notes } = req.body;

  // First create a payment record for manual profit
  const consultant = await prisma.consultant.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!consultant) {
    return res.status(404).json({ error: "Consultant not found" });
  }

  // Create a payment record for the manual profit
  const payment = await prisma.payment.create({
    data: {
      clientId: consultant.userId, // Use consultant's userId as clientId for manual payments
      consultantId: id,
      amount: parseFloat(amount),
      currency: "SAR",
      method: "BANK_TRANSFER",
      status: "COMPLETED",
      paidAt: new Date(),
      transactionId: `MANUAL-${Date.now()}-${id}`,
      invoiceNumber: `INV-MANUAL-${Date.now()}`,
    },
  });

  // Now create the earning with the valid paymentId
  const earning = await prisma.earning.create({
    data: {
      consultantId: id,
      paymentId: payment.id,
      amount: parseFloat(amount),
      platformFee: 0,
      netAmount: parseFloat(amount),
      status: "available",
    },
  });

  // Update consultant total earnings
  await prisma.consultant.update({
    where: { id },
    data: {
      totalEarnings: {
        increment: parseFloat(amount),
      },
    },
  });

  // Notify consultant
  await createNotification({
    userId: consultant.userId,
    type: "PAYMENT_RECEIVED",
    title: "Profit Received",
    message: `You have received ${amount} SAR as profit. Notes: ${
      notes || "N/A"
    }`,
    link: "/consultant/earnings",
  });

  // Notify admins
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "SUPER_ADMIN", "FINANCE"] },
    },
  });

  await createBulkNotifications(
    admins.map((admin) => ({
      userId: admin.id,
      type: "ADMIN_ALERT",
      title: "Manual Profit Sent",
      message: `Admin sent ${amount} SAR to consultant ${consultant.firstName} ${consultant.lastName}`,
      link: `/admin/consultants/${id}`,
    }))
  );

  res.json({
    message: "Profit sent successfully",
    earning,
  });
});

/**
 * Deduct from consultant
 */
export const deductFromConsultant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, reason } = req.body;

  // Update consultant total earnings (deduct)
  const consultant = await prisma.consultant.findUnique({
    where: { id },
  });

  if (!consultant) {
    return res.status(404).json({ error: "Consultant not found" });
  }

  await prisma.consultant.update({
    where: { id },
    data: {
      totalEarnings: {
        decrement: parseFloat(amount),
      },
    },
  });

  res.json({
    message: "Amount deducted successfully",
  });
});

/**
 * Suspend consultant account
 */
export const suspendConsultant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, duration } = req.body;

  const consultant = await prisma.consultant.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!consultant) {
    return res.status(404).json({ error: "Consultant not found" });
  }

  await prisma.user.update({
    where: { id: consultant.userId },
    data: { isActive: false },
  });

  await prisma.consultant.update({
    where: { id },
    data: { isAvailable: false },
  });

  res.json({
    message: "Consultant account suspended successfully",
  });
});

/**
 * Create client (Admin only)
 */
export const createClient = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    city,
    sector,
    companyName,
  } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res
      .status(400)
      .json({ error: "User with this email already exists" });
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "CLIENT",
      phone,
      emailVerified: true,
      client: {
        create: {
          firstName,
          lastName,
          city,
          sector,
          companyName,
        },
      },
    },
    include: {
      client: true,
    },
  });

  res.status(201).json({
    message: "Client created successfully",
    user,
  });
});

/**
 * Update client
 */
export const updateClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    phone,
    city,
    sector,
    companyName,
    isActive,
    dateOfBirth,
    gender,
    country,
    address,
    postalCode,
    accountType,
    companySize,
    commercialRegister,
    taxNumber,
    economicSector,
    industry,
    numberOfEmployees,
    jobTitle,
    website,
    linkedin,
    twitter,
    preferredServices,
    registrationPurpose,
    preferredConsultantId,
    preferredPaymentMethod,
    invoiceAddress,
    companyLogo,
    entityDefinition,
    notificationEmail,
    notificationApp,
    notificationWhatsApp,
    preferredLanguage,
    termsAccepted,
  } = req.body;

  const client = await prisma.client.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!client) {
    return res.status(404).json({ error: "Client not found" });
  }

  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
  if (gender) updateData.gender = gender;
  if (city) updateData.city = city;
  if (country) updateData.country = country;
  if (address) updateData.address = address;
  if (postalCode) updateData.postalCode = postalCode;
  if (accountType) updateData.accountType = accountType;
  if (sector) updateData.sector = sector;
  if (companyName) updateData.companyName = companyName;
  if (companySize) updateData.companySize = companySize;
  if (commercialRegister) updateData.commercialRegister = commercialRegister;
  if (taxNumber) updateData.taxNumber = taxNumber;
  if (economicSector) updateData.economicSector = economicSector;
  if (industry) updateData.industry = industry;
  if (numberOfEmployees !== undefined)
    updateData.numberOfEmployees = parseInt(numberOfEmployees);
  if (jobTitle) updateData.jobTitle = jobTitle;
  if (website) updateData.website = website;
  if (linkedin) updateData.linkedin = linkedin;
  if (twitter) updateData.twitter = twitter;
  if (preferredServices)
    updateData.preferredServices =
      typeof preferredServices === "string"
        ? preferredServices
        : JSON.stringify(preferredServices);
  if (registrationPurpose) updateData.registrationPurpose = registrationPurpose;
  if (preferredConsultantId)
    updateData.preferredConsultantId = preferredConsultantId;
  if (preferredPaymentMethod)
    updateData.preferredPaymentMethod = preferredPaymentMethod;
  if (invoiceAddress) updateData.invoiceAddress = invoiceAddress;
  if (companyLogo) updateData.companyLogo = companyLogo;
  if (entityDefinition) updateData.entityDefinition = entityDefinition;
  if (notificationEmail !== undefined)
    updateData.notificationEmail = notificationEmail;
  if (notificationApp !== undefined)
    updateData.notificationApp = notificationApp;
  if (notificationWhatsApp !== undefined)
    updateData.notificationWhatsApp = notificationWhatsApp;
  if (preferredLanguage) updateData.preferredLanguage = preferredLanguage;
  if (termsAccepted !== undefined) updateData.termsAccepted = termsAccepted;

  const updatedClient = await prisma.client.update({
    where: { id },
    data: {
      ...updateData,
      user: {
        update: {
          ...(phone && { phone }),
          ...(isActive !== undefined && { isActive }),
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          isActive: true,
        },
      },
    },
  });

  res.json({
    message: "Client updated successfully",
    client: updatedClient,
  });
});

/**
 * Delete client
 */
export const deleteClient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!client) {
    return res.status(404).json({ error: "Client not found" });
  }

  // Delete client (cascade will delete user)
  await prisma.client.delete({
    where: { id },
  });

  res.json({ message: "Client deleted successfully" });
});

/**
 * Create consultant (Admin only)
 */
export const createConsultant = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    academicDegree,
    specialization,
    bio,
    expertiseFields,
    pricePerSession,
  } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res
      .status(400)
      .json({ error: "User with this email already exists" });
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "CONSULTANT",
      phone,
      emailVerified: true,
      consultant: {
        create: {
          firstName,
          lastName,
          academicDegree,
          specialization,
          bio,
          expertiseFields: JSON.stringify(expertiseFields || []),
          pricePerSession: parseFloat(pricePerSession),
          isVerified: true,
        },
      },
    },
    include: {
      consultant: true,
    },
  });

  res.status(201).json({
    message: "Consultant created successfully",
    user,
  });
});

/**
 * Update consultant
 */
export const updateConsultant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    phone,
    academicDegree,
    specialization,
    bio,
    expertiseFields,
    pricePerSession,
    isVerified,
    isAvailable,
    isActive,
    dateOfBirth,
    gender,
    city,
    country,
    address,
    postalCode,
    yearsOfExperience,
    previousEmployers,
    areasOfExpertise,
    implementedProjects,
    languages,
    certifications,
    education,
    website,
    linkedin,
    twitter,
    profilePicture,
    sessionDuration,
    consultationMode,
    bankAccount,
    bankName,
    iban,
    academicCertificates,
    nationalId,
    consultingLicense,
    cvUrl,
    acceptsSessions,
    commissionPercentage,
    dueAmounts,
    financialAccountStatus,
  } = req.body;

  const consultant = await prisma.consultant.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!consultant) {
    return res.status(404).json({ error: "Consultant not found" });
  }

  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
  if (gender) updateData.gender = gender;
  if (academicDegree) updateData.academicDegree = academicDegree;
  if (specialization) updateData.specialization = specialization;
  if (bio !== undefined) updateData.bio = bio;
  if (expertiseFields)
    updateData.expertiseFields =
      typeof expertiseFields === "string"
        ? expertiseFields
        : JSON.stringify(expertiseFields);
  if (profilePicture) updateData.profilePicture = profilePicture;
  if (city) updateData.city = city;
  if (country) updateData.country = country;
  if (address) updateData.address = address;
  if (postalCode) updateData.postalCode = postalCode;
  if (yearsOfExperience !== undefined)
    updateData.yearsOfExperience = parseInt(yearsOfExperience);
  if (previousEmployers) updateData.previousEmployers = previousEmployers;
  if (areasOfExpertise)
    updateData.areasOfExpertise =
      typeof areasOfExpertise === "string"
        ? areasOfExpertise
        : JSON.stringify(areasOfExpertise);
  if (implementedProjects)
    updateData.implementedProjects =
      typeof implementedProjects === "string"
        ? implementedProjects
        : JSON.stringify(implementedProjects);
  if (languages)
    updateData.languages =
      typeof languages === "string" ? languages : JSON.stringify(languages);
  if (certifications)
    updateData.certifications =
      typeof certifications === "string"
        ? certifications
        : JSON.stringify(certifications);
  if (education)
    updateData.education =
      typeof education === "string" ? education : JSON.stringify(education);
  if (website) updateData.website = website;
  if (linkedin) updateData.linkedin = linkedin;
  if (twitter) updateData.twitter = twitter;
  if (pricePerSession) updateData.pricePerSession = parseFloat(pricePerSession);
  if (sessionDuration) updateData.sessionDuration = parseInt(sessionDuration);
  if (consultationMode)
    updateData.consultationMode =
      typeof consultationMode === "string"
        ? consultationMode
        : JSON.stringify(consultationMode);
  if (bankAccount) updateData.bankAccount = bankAccount;
  if (bankName) updateData.bankName = bankName;
  if (iban) updateData.iban = iban;
  if (commissionPercentage)
    updateData.commissionPercentage = parseFloat(commissionPercentage);
  if (dueAmounts !== undefined) updateData.dueAmounts = parseFloat(dueAmounts);
  if (financialAccountStatus)
    updateData.financialAccountStatus = financialAccountStatus;
  if (academicCertificates)
    updateData.academicCertificates =
      typeof academicCertificates === "string"
        ? academicCertificates
        : JSON.stringify(academicCertificates);
  if (nationalId) updateData.nationalId = nationalId;
  if (consultingLicense) updateData.consultingLicense = consultingLicense;
  if (cvUrl) updateData.cvUrl = cvUrl;
  if (isVerified !== undefined) updateData.isVerified = isVerified;
  if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
  if (acceptsSessions !== undefined)
    updateData.acceptsSessions = acceptsSessions;

  const updatedConsultant = await prisma.consultant.update({
    where: { id },
    data: {
      ...updateData,
      user: {
        update: {
          ...(phone && { phone }),
          ...(isActive !== undefined && { isActive }),
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          isActive: true,
        },
      },
    },
  });

  res.json({
    message: "Consultant updated successfully",
    consultant: updatedConsultant,
  });
});

/**
 * Delete consultant
 */
export const deleteConsultant = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const consultant = await prisma.consultant.findUnique({
    where: { id },
  });

  if (!consultant) {
    return res.status(404).json({ error: "Consultant not found" });
  }

  await prisma.consultant.delete({
    where: { id },
  });

  res.json({ message: "Consultant deleted successfully" });
});

/**
 * Get all bookings (Admin)
 */
export const getBookings = asyncHandler(async (req, res) => {
  const { status, type, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (status) where.status = status;
  if (type) where.bookingType = type;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        client: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
        consultant: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
        service: true,
        session: true,
        payment: true,
      },
      orderBy: { scheduledAt: "desc" },
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
 * Update booking (Admin)
 */
export const updateBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, scheduledAt, price, duration, consultantNotes } = req.body;

  const booking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);
  if (price) updateData.price = parseFloat(price);
  if (duration) updateData.duration = parseInt(duration);
  if (consultantNotes !== undefined)
    updateData.consultantNotes = consultantNotes;

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: updateData,
    include: {
      client: {
        include: {
          user: {
            select: {
              email: true,
              phone: true,
            },
          },
        },
      },
      consultant: {
        include: {
          user: {
            select: {
              email: true,
              phone: true,
            },
          },
        },
      },
      service: true,
    },
  });

  res.json({
    message: "Booking updated successfully",
    booking: updatedBooking,
  });
});

/**
 * Delete booking (Admin)
 */
export const deleteBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  await prisma.booking.delete({
    where: { id },
  });

  res.json({ message: "Booking deleted successfully" });
});

/**
 * Get all payments (Admin)
 */
export const getPayments = asyncHandler(async (req, res) => {
  const { status, method, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (status) where.status = status;
  if (method) where.method = method;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    email: true,
                    phone: true,
                  },
                },
              },
            },
            consultant: {
              include: {
                user: {
                  select: {
                    email: true,
                    phone: true,
                  },
                },
              },
            },
            service: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit),
    }),
    prisma.payment.count({ where }),
  ]);

  res.json({
    payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

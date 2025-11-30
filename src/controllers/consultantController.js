import prisma from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  createNotification,
  createBulkNotifications,
} from "../utils/notifications.js";

/**
 * Get consultant dashboard statistics
 */
export const getConsultantDashboardStats = asyncHandler(async (req, res) => {
  const consultant = await prisma.consultant.findUnique({
    where: { userId: req.userId },
  });

  if (!consultant) {
    return res.status(404).json({ error: "Consultant not found" });
  }

  const [
    totalSessions,
    pendingSessions,
    completedSessions,
    totalEarnings,
    upcomingSessions,
    recentSessions,
  ] = await Promise.all([
    prisma.booking.count({
      where: { consultantId: consultant.id },
    }),
    prisma.booking.count({
      where: {
        consultantId: consultant.id,
        status: "PENDING",
      },
    }),
    prisma.booking.count({
      where: {
        consultantId: consultant.id,
        status: "COMPLETED",
      },
    }),
    prisma.earning.aggregate({
      where: {
        consultantId: consultant.id,
        status: "available",
      },
      _sum: { netAmount: true },
    }),
    prisma.booking.findMany({
      where: {
        consultantId: consultant.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        scheduledAt: { gte: new Date() },
      },
      include: {
        client: {
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
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { consultantId: consultant.id },
      include: {
        client: {
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
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  res.json({
    stats: {
      totalSessions,
      pendingSessions,
      completedSessions,
      totalEarnings: totalEarnings._sum.netAmount || 0,
      rating: consultant.rating,
      totalRatings: consultant.totalRatings,
    },
    upcomingSessions,
    recentSessions,
  });
});

/**
 * Get all consultants
 */
export const getConsultants = asyncHandler(async (req, res) => {
  const { search, specialization, minRating, isAvailable } = req.query;

  const where = {
    isAvailable: isAvailable !== "false",
  };

  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { specialization: { contains: search } },
    ];
  }

  if (specialization) {
    where.specialization = { contains: specialization };
  }

  if (minRating) {
    where.rating = { gte: parseFloat(minRating) };
  }

  const consultants = await prisma.consultant.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          avatar: true,
          isActive: true,
        },
      },
    },
    orderBy: { rating: "desc" },
  });

  res.json({ consultants });
});

/**
 * Get consultant by ID
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
        },
      },
      availabilitySlots: true,
    },
  });

  if (!consultant) {
    return res
      .status(404)
      .json({ error: "Consultant not found From consultant controller" });
  }

  res.json({ consultant });
});

/**
 * Get consultant availability
 */
export const getAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  const consultant = await prisma.consultant.findUnique({
    where: { id },
    include: {
      availabilitySlots: true,
      bookings: {
        where: {
          status: { in: ["PENDING", "CONFIRMED"] },
          ...(date && {
            scheduledAt: {
              gte: new Date(date),
              lt: new Date(
                new Date(date).setDate(new Date(date).getDate() + 1)
              ),
            },
          }),
        },
      },
    },
  });

  if (!consultant) {
    return res.status(404).json({ error: "Consultant not found" });
  }

  res.json({
    availabilitySlots: consultant.availabilitySlots,
    bookedSlots: consultant.bookings.map((b) => ({
      time: b.selectedTimeSlot,
      date: b.scheduledAt,
    })),
  });
});

/**
 * Update consultant profile (Consultant only)
 */
export const updateProfile = asyncHandler(async (req, res) => {
  if (req.userRole !== "CONSULTANT") {
    return res
      .status(403)
      .json({ error: "Only consultants can update their profile" });
  }

  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    academicDegree,
    specialization,
    bio,
    expertiseFields,
    profilePicture,
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
    pricePerSession,
    sessionDuration,
    consultationMode,
    bankAccount,
    bankName,
    iban,
    academicCertificates,
    nationalId,
    consultingLicense,
    cvUrl,
    isAvailable,
    acceptsSessions,
  } = req.body;

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
  if (academicCertificates)
    updateData.academicCertificates =
      typeof academicCertificates === "string"
        ? academicCertificates
        : JSON.stringify(academicCertificates);
  if (nationalId) updateData.nationalId = nationalId;
  if (consultingLicense) updateData.consultingLicense = consultingLicense;
  if (cvUrl) updateData.cvUrl = cvUrl;
  if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
  if (acceptsSessions !== undefined)
    updateData.acceptsSessions = acceptsSessions;

  const consultant = await prisma.consultant.update({
    where: { userId: req.userId },
    data: updateData,
    include: {
      user: true,
    },
  });

  res.json({
    message: "Profile updated successfully",
    consultant,
  });
});

/**
 * Set availability slots (Consultant only)
 */
export const setAvailability = asyncHandler(async (req, res) => {
  if (req.userRole !== "CONSULTANT") {
    return res
      .status(403)
      .json({ error: "Only consultants can set availability" });
  }

  const { slots } = req.body; // Array of { dayOfWeek, startTime, endTime, isAvailable }

  const consultant = await prisma.consultant.findUnique({
    where: { userId: req.userId },
  });

  // Delete existing slots
  await prisma.availabilitySlot.deleteMany({
    where: { consultantId: consultant.id },
  });

  // Create new slots
  const createdSlots = await prisma.availabilitySlot.createMany({
    data: slots.map((slot) => ({
      consultantId: consultant.id,
      dayOfWeek: parseInt(slot.dayOfWeek),
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable !== false,
    })),
  });

  res.json({
    message: "Availability updated successfully",
    slots: createdSlots,
  });
});

/**
 * Get consultant earnings (Consultant only)
 */
export const getEarnings = asyncHandler(async (req, res) => {
  if (req.userRole !== "CONSULTANT") {
    return res
      .status(403)
      .json({ error: "Only consultants can view earnings" });
  }

  const consultant = await prisma.consultant.findUnique({
    where: { userId: req.userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!consultant) {
    console.error(
      `Consultant not found for userId: ${req.userId}, userRole: ${req.userRole}`
    );
    return res.status(404).json({
      error: "Consultant not found",
      message:
        "Your consultant profile may not be set up. Please contact support.",
      userId: req.userId,
    });
  }

  // Get all earnings
  const allEarnings = await prisma.earning.findMany({
    where: { consultantId: consultant.id },
    include: {
      payment: {
        include: {
          booking: {
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
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate totals (handle empty arrays)
  const totalEarnings =
    allEarnings.length > 0
      ? allEarnings.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
      : 0;
  const availableBalance =
    allEarnings.length > 0
      ? allEarnings
          .filter((e) => e.status === "available")
          .reduce((sum, e) => sum + (parseFloat(e.netAmount) || 0), 0)
      : 0;
  const pendingEarnings =
    allEarnings.length > 0
      ? allEarnings
          .filter((e) => e.status === "pending")
          .reduce((sum, e) => sum + (parseFloat(e.netAmount) || 0), 0)
      : 0;

  // Format earnings for frontend
  const formattedEarnings = allEarnings.map((earning) => ({
    id: earning.id,
    client: earning.payment?.booking?.client
      ? `${earning.payment.booking.client.firstName || ""} ${
          earning.payment.booking.client.lastName || ""
        }`.trim() ||
        earning.payment.booking.client.user?.email ||
        "Unknown"
      : "Unknown",
    amount: parseFloat(earning.netAmount),
    date: earning.createdAt.toISOString().split("T")[0],
    status:
      earning.status === "available"
        ? "paid"
        : earning.status === "pending"
        ? "pending"
        : "withdrawn",
    paymentId: earning.paymentId,
    bookingId: earning.payment?.bookingId,
  }));

  res.json({
    earnings: formattedEarnings,
    totalEarnings,
    availableBalance,
    pendingEarnings,
  });
});

/**
 * Request withdrawal/payout (Consultant only)
 */
export const requestWithdrawal = asyncHandler(async (req, res) => {
  if (req.userRole !== "CONSULTANT") {
    return res
      .status(403)
      .json({ error: "Only consultants can request withdrawals" });
  }

  const { amount, bankName, accountNumber, iban } = req.body;

  const consultant = await prisma.consultant.findUnique({
    where: { userId: req.userId },
    include: { user: true },
  });

  if (!consultant) {
    return res.status(404).json({ error: "Consultant not found" });
  }

  // Check available balance
  const availableEarnings = await prisma.earning.aggregate({
    where: {
      consultantId: consultant.id,
      status: "available",
    },
    _sum: { netAmount: true },
  });

  const availableBalance = availableEarnings._sum.netAmount || 0;

  if (parseFloat(amount) > parseFloat(availableBalance)) {
    return res.status(400).json({
      error: `Insufficient balance. Available: ${availableBalance} SAR, Requested: ${amount} SAR`,
    });
  }

  // Create withdrawal request
  const withdrawal = await prisma.withdrawal.create({
    data: {
      consultantId: consultant.id,
      userId: req.userId,
      amount: parseFloat(amount),
      bankName: bankName || consultant.bankName,
      accountNumber: accountNumber || consultant.bankAccount,
      iban: iban || consultant.IBAN,
      status: "PENDING",
    },
    include: {
      consultant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userId: true,
        },
      },
    },
  });

  // Notify consultant
  await createNotification({
    userId: req.userId,
    type: "WITHDRAWAL_REQUESTED",
    title: "Withdrawal Request Submitted",
    message: `Your withdrawal request of ${amount} SAR has been submitted and is pending admin approval.`,
    link: "/consultant/earnings",
  });

  // Notify all admins
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "SUPER_ADMIN", "FINANCE"] },
    },
  });

  await createBulkNotifications(
    admins.map((admin) => ({
      userId: admin.id,
      type: "WITHDRAWAL_REQUESTED",
      title: "New Withdrawal Request",
      message: `${consultant.firstName} ${consultant.lastName} requested withdrawal of ${amount} SAR`,
      link: `/admin/consultants/${consultant.id}/withdrawals`,
      metadata: JSON.stringify({
        withdrawalId: withdrawal.id,
        consultantId: consultant.id,
      }),
    }))
  );

  res.status(201).json({
    message: "Withdrawal request submitted successfully",
    withdrawal,
  });
});

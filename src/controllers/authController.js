import prisma from '../config/database.js';
import { hashPassword, comparePassword, validatePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { createNotification } from '../utils/notifications.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Register new user
 */
export const register = asyncHandler(async (req, res) => {
  const { email, password, role = 'CLIENT', firstName, lastName, phone, ...additionalData } = req.body;

  // Validate password
  if (!validatePassword(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters with uppercase, lowercase, and number',
    });
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user based on role
  let userData = {
    email,
    password: hashedPassword,
    role,
    phone,
  };

  if (role === 'CLIENT') {
    userData.client = {
      create: {
        firstName,
        lastName,
        dateOfBirth: additionalData.dateOfBirth ? new Date(additionalData.dateOfBirth) : null,
        gender: additionalData.gender,
        city: additionalData.city,
        country: additionalData.country || 'Saudi Arabia',
        address: additionalData.address,
        postalCode: additionalData.postalCode,
        accountType: additionalData.accountType,
        sector: additionalData.sector,
        companyName: additionalData.companyName,
        commercialName: additionalData.commercialName,
        companySize: additionalData.companySize,
        commercialRegister: additionalData.commercialRegister,
        commercialRegisterFile: additionalData.commercialRegisterFile,
        taxNumber: additionalData.taxNumber,
        economicSector: additionalData.economicSector,
        industry: additionalData.industry,
        numberOfEmployees: additionalData.numberOfEmployees ? parseInt(additionalData.numberOfEmployees) : null,
        jobTitle: additionalData.jobTitle,
        website: additionalData.website,
        linkedin: additionalData.linkedin,
        twitter: additionalData.twitter,
        preferredServices: additionalData.preferredServices ? JSON.stringify(additionalData.preferredServices) : null,
        registrationPurpose: additionalData.registrationPurpose,
        preferredConsultantId: additionalData.preferredConsultantId,
        preferredPaymentMethod: additionalData.preferredPaymentMethod,
        invoiceAddress: additionalData.invoiceAddress,
        companyLogo: additionalData.companyLogo,
        entityDefinition: additionalData.entityDefinition,
        notificationEmail: additionalData.notificationEmail !== false,
        notificationApp: additionalData.notificationApp !== false,
        notificationWhatsApp: additionalData.notificationWhatsApp || false,
        preferredLanguage: additionalData.preferredLanguage || 'ar',
        termsAccepted: additionalData.termsAccepted || false,
      },
    };
  } else if (role === 'CONSULTANT') {
    userData.consultant = {
      create: {
        firstName,
        lastName,
        dateOfBirth: additionalData.dateOfBirth ? new Date(additionalData.dateOfBirth) : null,
        gender: additionalData.gender,
        academicTitle: additionalData.academicTitle,
        academicDegree: additionalData.academicDegree,
        university: additionalData.university,
        graduationYear: additionalData.graduationYear ? parseInt(additionalData.graduationYear) : null,
        specialization: additionalData.specialization,
        specificSpecialization: additionalData.specificSpecialization,
        professionalCourses: additionalData.professionalCourses,
        bio: additionalData.bio,
        expertiseFields: JSON.stringify(additionalData.expertiseFields || []),
        profilePicture: additionalData.profilePicture,
        city: additionalData.city,
        country: additionalData.country || 'Saudi Arabia',
        address: additionalData.address,
        postalCode: additionalData.postalCode,
        yearsOfExperience: additionalData.yearsOfExperience ? parseInt(additionalData.yearsOfExperience) : 0,
        previousEmployers: additionalData.previousEmployers,
        areasOfExpertise: additionalData.areasOfExpertise ? JSON.stringify(additionalData.areasOfExpertise) : null,
        implementedProjects: additionalData.implementedProjects ? JSON.stringify(additionalData.implementedProjects) : null,
        languages: additionalData.languages ? JSON.stringify(additionalData.languages) : null,
        certifications: additionalData.certifications ? JSON.stringify(additionalData.certifications) : null,
        education: additionalData.education ? JSON.stringify(additionalData.education) : null,
        website: additionalData.website,
        linkedin: additionalData.linkedin,
        twitter: additionalData.twitter,
        pricePerSession: additionalData.pricePerSession || 0,
        sessionDuration: additionalData.sessionDuration || 60,
        consultationMode: additionalData.consultationMode ? JSON.stringify(additionalData.consultationMode) : null,
        bankAccount: additionalData.bankAccount,
        bankName: additionalData.bankName,
        iban: additionalData.iban,
        academicCertificates: additionalData.academicCertificates ? JSON.stringify(additionalData.academicCertificates) : null,
        nationalId: additionalData.nationalId,
        consultingLicense: additionalData.consultingLicense,
        cvUrl: additionalData.cvUrl,
        isAvailable: true,
        acceptsSessions: additionalData.acceptsSessions !== false,
      },
    };
  }

  const user = await prisma.user.create({
    data: userData,
    include: {
      client: role === 'CLIENT',
      consultant: role === 'CONSULTANT',
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id });

  // Create welcome notification
  await createNotification({
    userId: user.id,
    type: 'SYSTEM_NOTIFICATION',
    title: 'Welcome to Jadwa Consulting Platform',
    message: 'Thank you for joining us!',
  });

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  });
});

/**
 * Login user
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      client: true,
      consultant: true,
      admin: true,
    },
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Account is deactivated' });
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Generate tokens
  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id });

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      ...(user.client && { client: user.client }),
      ...(user.consultant && { consultant: user.consultant }),
      ...(user.admin && { admin: user.admin }),
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  });
});

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  const { verifyRefreshToken } = await import('../utils/jwt.js');
  const decoded = verifyRefreshToken(token);

  // Verify user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  // Generate new tokens
  const { generateAccessToken, generateRefreshToken } = await import('../utils/jwt.js');
  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const newRefreshToken = generateRefreshToken({ userId: user.id });

  res.json({
    tokens: {
      accessToken,
      refreshToken: newRefreshToken,
    },
  });
});

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: {
      client: true,
      consultant: true,
      admin: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
});

/**
 * Update profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { phone, avatar, email, ...profileData } = req.body;
  const updateData = {};

  if (phone !== undefined) updateData.phone = phone;
  if (avatar !== undefined) updateData.avatar = avatar;
  // Note: email update is handled separately via updateEmail endpoint

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { client: true, consultant: true, admin: true },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: req.userId },
    data: updateData,
  });

  // Update client or consultant profile
  if (user.client) {
    const clientUpdateData = {};
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== undefined) {
        if (['preferredServices', 'areasOfExpertise', 'implementedProjects', 'languages', 'certifications', 'education', 'consultationMode', 'academicCertificates'].includes(key)) {
          clientUpdateData[key] = typeof profileData[key] === 'string' ? profileData[key] : JSON.stringify(profileData[key]);
        } else if (key === 'dateOfBirth') {
          clientUpdateData[key] = profileData[key] ? new Date(profileData[key]) : null;
        } else if (['numberOfEmployees', 'yearsOfExperience', 'sessionDuration'].includes(key)) {
          clientUpdateData[key] = profileData[key] ? parseInt(profileData[key]) : null;
        } else {
          clientUpdateData[key] = profileData[key];
        }
      }
    });

    if (Object.keys(clientUpdateData).length > 0) {
      await prisma.client.update({
        where: { userId: req.userId },
        data: clientUpdateData,
      });
    }
  } else if (user.consultant) {
    const consultantUpdateData = {};
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== undefined) {
        if (['expertiseFields', 'areasOfExpertise', 'implementedProjects', 'languages', 'certifications', 'education', 'consultationMode', 'academicCertificates'].includes(key)) {
          consultantUpdateData[key] = typeof profileData[key] === 'string' ? profileData[key] : JSON.stringify(profileData[key]);
        } else if (key === 'dateOfBirth') {
          consultantUpdateData[key] = profileData[key] ? new Date(profileData[key]) : null;
        } else if (['numberOfEmployees', 'yearsOfExperience', 'sessionDuration'].includes(key)) {
          consultantUpdateData[key] = profileData[key] ? parseInt(profileData[key]) : null;
        } else if (key === 'pricePerSession' || key === 'commissionPercentage' || key === 'dueAmounts' || key === 'totalEarnings') {
          consultantUpdateData[key] = parseFloat(profileData[key]);
        } else {
          consultantUpdateData[key] = profileData[key];
        }
      }
    });

    if (Object.keys(consultantUpdateData).length > 0) {
      await prisma.consultant.update({
        where: { userId: req.userId },
        data: consultantUpdateData,
      });
    }
  }

  const updatedProfile = await prisma.user.findUnique({
    where: { id: req.userId },
    include: {
      client: true,
      consultant: true,
      admin: true,
    },
  });

  res.json({
    message: 'Profile updated successfully',
    user: updatedProfile,
  });
});

/**
 * Change password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters with uppercase, lowercase, and number',
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  const isValidPassword = await comparePassword(currentPassword, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: req.userId },
    data: { password: hashedPassword },
  });

  res.json({ message: 'Password changed successfully' });
});

/**
 * Update email
 */
export const updateEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser && existingUser.id !== req.userId) {
    return res.status(400).json({ error: 'Email already in use' });
  }

  await prisma.user.update({
    where: { id: req.userId },
    data: { 
      email,
      emailVerified: false, // Require re-verification
    },
  });

  res.json({ message: 'Email updated successfully. Please verify your new email.' });
});


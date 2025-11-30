import prisma from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all system settings
 */
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await prisma.systemSetting.findMany({
    orderBy: { key: 'asc' },
  });

  // Convert array to object for easier access
  const settingsObj = {};
  settings.forEach((setting) => {
    settingsObj[setting.key] = setting.value;
  });

  res.json({ settings: settingsObj });
});

/**
 * Get setting by key
 */
export const getSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const setting = await prisma.systemSetting.findUnique({
    where: { key },
  });

  if (!setting) {
    return res.status(404).json({ error: 'Setting not found' });
  }

  res.json({ setting });
});

/**
 * Update or create setting
 */
export const updateSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value, description } = req.body;

  const setting = await prisma.systemSetting.upsert({
    where: { key },
    update: {
      value: value ? JSON.stringify(value) : undefined,
      description,
    },
    create: {
      key,
      value: value ? JSON.stringify(value) : undefined,
      description,
    },
  });

  res.json({
    message: 'Setting updated successfully',
    setting,
  });
});

/**
 * Update multiple settings at once
 */
export const updateSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body; // { key: value, ... }

  const updates = Object.entries(settings).map(([key, value]) =>
    prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: JSON.stringify(value),
      },
      create: {
        key,
        value: JSON.stringify(value),
      },
    })
  );

  await Promise.all(updates);

  res.json({
    message: 'Settings updated successfully',
  });
});

/**
 * Get general settings
 */
export const getGeneralSettings = asyncHandler(async (req, res) => {
  const keys = [
    'platformName',
    'platformEmail',
    'platformPhone',
    'platformAddress',
    'enableNotifications',
    'enableEmailNotifications',
  ];

  const settings = await prisma.systemSetting.findMany({
    where: {
      key: { in: keys },
    },
  });

  const settingsObj = {};
  settings.forEach((setting) => {
    try {
      settingsObj[setting.key] = JSON.parse(setting.value);
    } catch {
      settingsObj[setting.key] = setting.value;
    }
  });

  res.json({ settings: settingsObj });
});

/**
 * Update general settings
 */
export const updateGeneralSettings = asyncHandler(async (req, res) => {
  const {
    platformName,
    platformEmail,
    platformPhone,
    platformAddress,
    enableNotifications,
    enableEmailNotifications,
  } = req.body;

  const updates = [];

  if (platformName !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'platformName' },
        update: { value: JSON.stringify(platformName) },
        create: { key: 'platformName', value: JSON.stringify(platformName) },
      })
    );
  }

  if (platformEmail !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'platformEmail' },
        update: { value: JSON.stringify(platformEmail) },
        create: { key: 'platformEmail', value: JSON.stringify(platformEmail) },
      })
    );
  }

  if (platformPhone !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'platformPhone' },
        update: { value: JSON.stringify(platformPhone) },
        create: { key: 'platformPhone', value: JSON.stringify(platformPhone) },
      })
    );
  }

  if (platformAddress !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'platformAddress' },
        update: { value: JSON.stringify(platformAddress) },
        create: { key: 'platformAddress', value: JSON.stringify(platformAddress) },
      })
    );
  }

  if (enableNotifications !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'enableNotifications' },
        update: { value: JSON.stringify(enableNotifications) },
        create: { key: 'enableNotifications', value: JSON.stringify(enableNotifications) },
      })
    );
  }

  if (enableEmailNotifications !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'enableEmailNotifications' },
        update: { value: JSON.stringify(enableEmailNotifications) },
        create: { key: 'enableEmailNotifications', value: JSON.stringify(enableEmailNotifications) },
      })
    );
  }

  await Promise.all(updates);

  res.json({
    message: 'General settings updated successfully',
  });
});

/**
 * Get payment settings
 */
export const getPaymentSettings = asyncHandler(async (req, res) => {
  const keys = [
    'paymentGateway',
    'paymentApiKey',
    'paymentSecretKey',
    'commissionRate',
    'enableAutoPayout',
  ];

  const settings = await prisma.systemSetting.findMany({
    where: {
      key: { in: keys },
    },
  });

  const settingsObj = {};
  settings.forEach((setting) => {
    try {
      settingsObj[setting.key] = JSON.parse(setting.value);
    } catch {
      settingsObj[setting.key] = setting.value;
    }
  });

  res.json({ settings: settingsObj });
});

/**
 * Update payment settings
 */
export const updatePaymentSettings = asyncHandler(async (req, res) => {
  const {
    paymentGateway,
    paymentApiKey,
    paymentSecretKey,
    commissionRate,
    enableAutoPayout,
  } = req.body;

  const updates = [];

  if (paymentGateway !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'paymentGateway' },
        update: { value: JSON.stringify(paymentGateway) },
        create: { key: 'paymentGateway', value: JSON.stringify(paymentGateway) },
      })
    );
  }

  if (paymentApiKey !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'paymentApiKey' },
        update: { value: JSON.stringify(paymentApiKey) },
        create: { key: 'paymentApiKey', value: JSON.stringify(paymentApiKey) },
      })
    );
  }

  if (paymentSecretKey !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'paymentSecretKey' },
        update: { value: JSON.stringify(paymentSecretKey) },
        create: { key: 'paymentSecretKey', value: JSON.stringify(paymentSecretKey) },
      })
    );
  }

  if (commissionRate !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'commissionRate' },
        update: { value: JSON.stringify(commissionRate) },
        create: { key: 'commissionRate', value: JSON.stringify(commissionRate) },
      })
    );
  }

  if (enableAutoPayout !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'enableAutoPayout' },
        update: { value: JSON.stringify(enableAutoPayout) },
        create: { key: 'enableAutoPayout', value: JSON.stringify(enableAutoPayout) },
      })
    );
  }

  await Promise.all(updates);

  res.json({
    message: 'Payment settings updated successfully',
  });
});

/**
 * Get integration settings
 */
export const getIntegrationSettings = asyncHandler(async (req, res) => {
  const keys = [
    'videoService',
    'videoApiKey',
    'emailService',
    'smtpHost',
    'smtpPort',
    'smtpUser',
    'smtpPassword',
  ];

  const settings = await prisma.systemSetting.findMany({
    where: {
      key: { in: keys },
    },
  });

  const settingsObj = {};
  settings.forEach((setting) => {
    try {
      settingsObj[setting.key] = JSON.parse(setting.value);
    } catch {
      settingsObj[setting.key] = setting.value;
    }
  });

  res.json({ settings: settingsObj });
});

/**
 * Update integration settings
 */
export const updateIntegrationSettings = asyncHandler(async (req, res) => {
  const {
    videoService,
    videoApiKey,
    emailService,
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPassword,
  } = req.body;

  const updates = [];

  if (videoService !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'videoService' },
        update: { value: JSON.stringify(videoService) },
        create: { key: 'videoService', value: JSON.stringify(videoService) },
      })
    );
  }

  if (videoApiKey !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'videoApiKey' },
        update: { value: JSON.stringify(videoApiKey) },
        create: { key: 'videoApiKey', value: JSON.stringify(videoApiKey) },
      })
    );
  }

  if (emailService !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'emailService' },
        update: { value: JSON.stringify(emailService) },
        create: { key: 'emailService', value: JSON.stringify(emailService) },
      })
    );
  }

  if (smtpHost !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'smtpHost' },
        update: { value: JSON.stringify(smtpHost) },
        create: { key: 'smtpHost', value: JSON.stringify(smtpHost) },
      })
    );
  }

  if (smtpPort !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'smtpPort' },
        update: { value: JSON.stringify(smtpPort) },
        create: { key: 'smtpPort', value: JSON.stringify(smtpPort) },
      })
    );
  }

  if (smtpUser !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'smtpUser' },
        update: { value: JSON.stringify(smtpUser) },
        create: { key: 'smtpUser', value: JSON.stringify(smtpUser) },
      })
    );
  }

  if (smtpPassword !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'smtpPassword' },
        update: { value: JSON.stringify(smtpPassword) },
        create: { key: 'smtpPassword', value: JSON.stringify(smtpPassword) },
      })
    );
  }

  await Promise.all(updates);

  res.json({
    message: 'Integration settings updated successfully',
  });
});


import prisma from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get system logs
 */
export const getSystemLogs = asyncHandler(async (req, res) => {
  const { level, userId, page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (level) where.level = level;
  if (userId) where.userId = userId;

  const [logs, total] = await Promise.all([
    prisma.systemLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.systemLog.count({ where }),
  ]);

  res.json({
    logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Get audit logs
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { action, resourceType, resourceId, userId, page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (action) where.action = action;
  if (resourceType) where.resourceType = resourceType;
  if (resourceId) where.resourceId = resourceId;
  if (userId) where.userId = userId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.auditLog.count({ where }),
  ]);

  res.json({
    logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Create system log
 */
export const createSystemLog = async (level, message, context = {}, userId = null, req = null) => {
  try {
    await prisma.systemLog.create({
      data: {
        level,
        message,
        context: JSON.stringify(context),
        userId,
        ipAddress: req?.ip || req?.socket?.remoteAddress,
        userAgent: req?.headers['user-agent'],
      },
    });
  } catch (error) {
    console.error('Error creating system log:', error);
  }
};

/**
 * Create audit log
 */
export const createAuditLog = async (userId, action, resourceType, resourceId, changes = null, description = null, req = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resourceType,
        resourceId,
        changes: changes ? JSON.stringify(changes) : null,
        description,
        ipAddress: req?.ip || req?.socket?.remoteAddress,
        userAgent: req?.headers['user-agent'],
      },
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

/**
 * Get security statistics
 */
export const getSecurityStats = asyncHandler(async (req, res) => {
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);

  const [
    totalLogins,
    failedLogins,
    suspiciousActivities,
    activeUsers,
    recentAudits,
  ] = await Promise.all([
    prisma.auditLog.count({
      where: {
        action: 'LOGIN',
        createdAt: { gte: last24Hours },
      },
    }),
    prisma.systemLog.count({
      where: {
        level: 'WARNING',
        message: { contains: 'login' },
        createdAt: { gte: last24Hours },
      },
    }),
    prisma.systemLog.count({
      where: {
        level: 'ERROR',
        createdAt: { gte: last24Hours },
      },
    }),
    prisma.user.count({
      where: {
        isActive: true,
        lastLogin: { gte: last24Hours },
      },
    }),
    prisma.auditLog.findMany({
      where: {
        action: { in: ['CREATE', 'UPDATE', 'DELETE'] },
        createdAt: { gte: last24Hours },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    }),
  ]);

  res.json({
    stats: {
      totalLogins,
      failedLogins,
      suspiciousActivities,
      activeUsers,
    },
    recentAudits,
  });
});

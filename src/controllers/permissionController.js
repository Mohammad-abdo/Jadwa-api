import prisma from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all permissions
 */
export const getPermissions = asyncHandler(async (req, res) => {
  const { resource, action } = req.query;
  const where = {};

  if (resource) where.resource = resource;
  if (action) where.action = action;

  const permissions = await prisma.permission.findMany({
    where,
    orderBy: [{ resource: 'asc' }, { action: 'asc' }],
  });

  res.json({ permissions });
});

/**
 * Get all roles
 */
export const getRoles = asyncHandler(async (req, res) => {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: { userRoles: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ roles });
});

/**
 * Create role
 */
export const createRole = asyncHandler(async (req, res) => {
  const { name, nameAr, description, permissionIds = [] } = req.body;

  const role = await prisma.role.create({
    data: {
      name,
      nameAr,
      description,
      permissions: {
        create: permissionIds.map((permissionId) => ({
          permissionId,
        })),
      },
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  res.status(201).json({
    message: 'Role created successfully',
    role,
  });
});

/**
 * Update role
 */
export const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, nameAr, description, permissionIds } = req.body;

  // Check if role is system role
  const existingRole = await prisma.role.findUnique({
    where: { id },
  });

  if (existingRole?.isSystem && name !== existingRole.name) {
    return res.status(400).json({ error: 'Cannot rename system role' });
  }

  // Update role
  const role = await prisma.role.update({
    where: { id },
    data: {
      name,
      nameAr,
      description,
    },
  });

  // Update permissions if provided
  if (permissionIds) {
    // Delete existing permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    // Add new permissions
    await prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId: id,
        permissionId,
      })),
    });
  }

  const updatedRole = await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  res.json({
    message: 'Role updated successfully',
    role: updatedRole,
  });
});

/**
 * Delete role
 */
export const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const role = await prisma.role.findUnique({
    where: { id },
  });

  if (!role) {
    return res.status(404).json({ error: 'Role not found' });
  }

  if (role.isSystem) {
    return res.status(400).json({ error: 'Cannot delete system role' });
  }

  await prisma.role.delete({
    where: { id },
  });

  res.json({ message: 'Role deleted successfully' });
});

/**
 * Assign role to user
 */
export const assignRoleToUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { roleId, expiresAt } = req.body;

  const assignment = await prisma.userRoleAssignment.create({
    data: {
      userId,
      roleId,
      assignedBy: req.userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  res.status(201).json({
    message: 'Role assigned successfully',
    assignment,
  });
});

/**
 * Remove role from user
 */
export const removeRoleFromUser = asyncHandler(async (req, res) => {
  const { userId, roleId } = req.params;

  await prisma.userRoleAssignment.deleteMany({
    where: {
      userId,
      roleId,
    },
  });

  res.json({ message: 'Role removed successfully' });
});

/**
 * Get user permissions
 */
export const getUserPermissions = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Get user's direct role permissions
  const userRoleAssignments = await prisma.userRoleAssignment.findMany({
    where: {
      userId,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  // Get user's default role permissions (from User.role)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  // Combine all permissions
  const permissions = new Set();
  
  userRoleAssignments.forEach((assignment) => {
    assignment.role.permissions.forEach((rp) => {
      permissions.add(rp.permission.name);
    });
  });

  // Add default role permissions (if any)
  // This would need to be configured based on UserRole enum

  res.json({
    permissions: Array.from(permissions),
    roles: userRoleAssignments.map((a) => a.role),
  });
});

/**
 * Initialize default permissions
 */
export const initializePermissions = asyncHandler(async (req, res) => {
  const defaultPermissions = [
    // Bookings
    { name: 'bookings:create', nameAr: 'إنشاء حجوزات', resource: 'bookings', action: 'create' },
    { name: 'bookings:read', nameAr: 'قراءة الحجوزات', resource: 'bookings', action: 'read' },
    { name: 'bookings:update', nameAr: 'تحديث الحجوزات', resource: 'bookings', action: 'update' },
    { name: 'bookings:delete', nameAr: 'حذف الحجوزات', resource: 'bookings', action: 'delete' },
    
    // Payments
    { name: 'payments:create', nameAr: 'إنشاء مدفوعات', resource: 'payments', action: 'create' },
    { name: 'payments:read', nameAr: 'قراءة المدفوعات', resource: 'payments', action: 'read' },
    { name: 'payments:update', nameAr: 'تحديث المدفوعات', resource: 'payments', action: 'update' },
    { name: 'payments:delete', nameAr: 'حذف المدفوعات', resource: 'payments', action: 'delete' },
    
    // Users
    { name: 'users:create', nameAr: 'إنشاء مستخدمين', resource: 'users', action: 'create' },
    { name: 'users:read', nameAr: 'قراءة المستخدمين', resource: 'users', action: 'read' },
    { name: 'users:update', nameAr: 'تحديث المستخدمين', resource: 'users', action: 'update' },
    { name: 'users:delete', nameAr: 'حذف المستخدمين', resource: 'users', action: 'delete' },
    
    // Consultants
    { name: 'consultants:create', nameAr: 'إنشاء مستشارين', resource: 'consultants', action: 'create' },
    { name: 'consultants:read', nameAr: 'قراءة المستشارين', resource: 'consultants', action: 'read' },
    { name: 'consultants:update', nameAr: 'تحديث المستشارين', resource: 'consultants', action: 'update' },
    { name: 'consultants:delete', nameAr: 'حذف المستشارين', resource: 'consultants', action: 'delete' },
    { name: 'consultants:approve', nameAr: 'الموافقة على المستشارين', resource: 'consultants', action: 'approve' },
    
    // Services
    { name: 'services:create', nameAr: 'إنشاء خدمات', resource: 'services', action: 'create' },
    { name: 'services:read', nameAr: 'قراءة الخدمات', resource: 'services', action: 'read' },
    { name: 'services:update', nameAr: 'تحديث الخدمات', resource: 'services', action: 'update' },
    { name: 'services:delete', nameAr: 'حذف الخدمات', resource: 'services', action: 'delete' },
    
    // Reports
    { name: 'reports:create', nameAr: 'إنشاء تقارير', resource: 'reports', action: 'create' },
    { name: 'reports:read', nameAr: 'قراءة التقارير', resource: 'reports', action: 'read' },
    { name: 'reports:update', nameAr: 'تحديث التقارير', resource: 'reports', action: 'update' },
    { name: 'reports:delete', nameAr: 'حذف التقارير', resource: 'reports', action: 'delete' },
    { name: 'reports:review', nameAr: 'مراجعة التقارير', resource: 'reports', action: 'review' },
    
    // Articles
    { name: 'articles:create', nameAr: 'إنشاء مقالات', resource: 'articles', action: 'create' },
    { name: 'articles:read', nameAr: 'قراءة المقالات', resource: 'articles', action: 'read' },
    { name: 'articles:update', nameAr: 'تحديث المقالات', resource: 'articles', action: 'update' },
    { name: 'articles:delete', nameAr: 'حذف المقالات', resource: 'articles', action: 'delete' },
    { name: 'articles:publish', nameAr: 'نشر المقالات', resource: 'articles', action: 'publish' },
    
    // CMS
    { name: 'cms:create', nameAr: 'إنشاء صفحات', resource: 'cms', action: 'create' },
    { name: 'cms:read', nameAr: 'قراءة الصفحات', resource: 'cms', action: 'read' },
    { name: 'cms:update', nameAr: 'تحديث الصفحات', resource: 'cms', action: 'update' },
    { name: 'cms:delete', nameAr: 'حذف الصفحات', resource: 'cms', action: 'delete' },
    
    // Roles & Permissions
    { name: 'roles:create', nameAr: 'إنشاء أدوار', resource: 'roles', action: 'create' },
    { name: 'roles:read', nameAr: 'قراءة الأدوار', resource: 'roles', action: 'read' },
    { name: 'roles:update', nameAr: 'تحديث الأدوار', resource: 'roles', action: 'update' },
    { name: 'roles:delete', nameAr: 'حذف الأدوار', resource: 'roles', action: 'delete' },
    
    // Settings
    { name: 'settings:read', nameAr: 'قراءة الإعدادات', resource: 'settings', action: 'read' },
    { name: 'settings:update', nameAr: 'تحديث الإعدادات', resource: 'settings', action: 'update' },
    
    // Monitoring
    { name: 'monitoring:read', nameAr: 'قراءة المراقبة', resource: 'monitoring', action: 'read' },
    { name: 'monitoring:logs', nameAr: 'عرض السجلات', resource: 'monitoring', action: 'logs' },
  ];

  const createdPermissions = [];
  for (const perm of defaultPermissions) {
    const existing = await prisma.permission.findUnique({
      where: { name: perm.name },
    });

    if (!existing) {
      const created = await prisma.permission.create({
        data: perm,
      });
      createdPermissions.push(created);
    }
  }

  res.json({
    message: 'Permissions initialized',
    created: createdPermissions.length,
    permissions: createdPermissions,
  });
});



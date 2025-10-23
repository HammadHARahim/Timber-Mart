import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sequelize } from '../config/database.js';
import logger from '../config/logger.js';

/**
 * SEED ROLES AND PERMISSIONS
 * Based on requirements: Section 12.1 - User Roles & Permissions Matrix
 *
 * Roles:
 * - ADMIN: Full system access
 * - MANAGER: Team management, approvals, reports
 * - SALES_OFFICER: Customer/order management
 * - WAREHOUSE_STAFF: Inventory and fulfillment
 * - ACCOUNTANT: Financial operations
 */

const PERMISSIONS = {
  // Customer Management
  CUSTOMER_VIEW: 'customer.view',
  CUSTOMER_CREATE: 'customer.create',
  CUSTOMER_EDIT: 'customer.edit',
  CUSTOMER_DELETE: 'customer.delete',

  // Order Management
  ORDER_VIEW: 'order.view',
  ORDER_CREATE: 'order.create',
  ORDER_EDIT: 'order.edit',
  ORDER_DELETE: 'order.delete',

  // Payment Management
  PAYMENT_VIEW: 'payment.view',
  PAYMENT_CREATE: 'payment.create',
  PAYMENT_APPROVE: 'payment.approve',

  // Check Management
  CHECK_VIEW: 'check.view',
  CHECK_CREATE: 'check.create',
  CHECK_CLEAR: 'check.clear',

  // Project Management
  PROJECT_VIEW: 'project.view',
  PROJECT_CREATE: 'project.create',
  PROJECT_EDIT: 'project.edit',

  // Reporting
  REPORT_VIEW: 'report.view',
  REPORT_EXPORT: 'report.export',

  // User Management (Admin only)
  USER_CREATE: 'user.create',
  USER_EDIT: 'user.edit',
  USER_DELETE: 'user.delete',
  ROLE_ASSIGN: 'role.assign',

  // System Settings
  SYSTEM_SETTINGS: 'system.settings',
  SYNC_MANAGE: 'system.sync_manage'
};

// Role-Permission Mapping from requirements
const ROLE_PERMISSIONS = {
  ADMIN: ['*'], // All permissions
  MANAGER: [
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.PAYMENT_APPROVE,
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.SYNC_MANAGE
  ],
  SALES_OFFICER: [
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_EDIT,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_EDIT,
    PERMISSIONS.PAYMENT_CREATE
  ],
  WAREHOUSE_STAFF: [
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_EDIT,
    PERMISSIONS.PAYMENT_VIEW
  ],
  ACCOUNTANT: [
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.PAYMENT_APPROVE,
    PERMISSIONS.CHECK_VIEW,
    PERMISSIONS.CHECK_CREATE,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT
  ]
};

/**
 * Seed default admin user
 * Based on requirements: Default admin for initial login
 */
export async function seedRolesAndPermissions() {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ where: { username: 'admin' } });

    if (adminExists) {
      logger.info('Admin user already exists');
      return;
    }

    logger.info('Creating default admin user...');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('admin123', salt);

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@timbermart.com',
      password_hash,
      full_name: 'System Administrator',
      role: 'ADMIN',
      is_active: true,
      department: 'Administration'
    });

    logger.info('Default admin user created');
    logger.info('  Username: admin');
    logger.info('  Password: admin123');
    logger.info('  Role: ADMIN');
    logger.warn('Please change the default admin password after first login');

    return admin;
  } catch (error) {
    logger.error(`Error seeding data: ${error.message}`);
    throw error;
  }
}

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user has permission
 */
export function hasPermission(userPermissions, requiredPermission) {
  if (!userPermissions) return false;
  if (userPermissions.includes('*')) return true;
  return userPermissions.includes(requiredPermission);
}

export { PERMISSIONS, ROLE_PERMISSIONS };

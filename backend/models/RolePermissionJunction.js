import { Sequelize } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * ROLE_PERMISSION JUNCTION TABLE
 * Maps roles to permissions (Many-to-Many)
 */
const RolePermission = sequelize.define('RolePermission', {}, {
  tableName: 'role_permissions',
  timestamps: false,
});
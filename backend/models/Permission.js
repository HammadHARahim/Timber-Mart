import { Sequelize } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * PERMISSION MODEL
 * Defines all available permissions
 */
const Permission = sequelize.define('Permission', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  permission_name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  module: {
    type: Sequelize.STRING, // 'customer', 'order', 'payment', etc.
    allowNull: false,
  },
}, {
  tableName: 'permissions',
  timestamps: false,
});
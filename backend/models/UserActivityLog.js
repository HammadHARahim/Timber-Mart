/**
 * USER_ACTIVITY_LOG MODEL
 * Tracks all user actions for auditing
 */

import { Sequelize } from 'sequelize';
import { sequelize } from '../config/database.js';
import  User  from './User.js';

const UserActivityLog = sequelize.define('UserActivityLog', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  action: {
    type: Sequelize.STRING, // 'CREATE_ORDER', 'EDIT_CUSTOMER', etc.
    allowNull: false,
  },
  entity_type: {
    type: Sequelize.STRING, // 'order', 'customer', 'payment'
    allowNull: false,
  },
  entity_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  old_values: {
    type: Sequelize.JSON,
    allowNull: true,
  },
  new_values: {
    type: Sequelize.JSON,
    allowNull: true,
  },
  ip_address: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  timestamp: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  tableName: 'user_activity_logs',
  timestamps: false,
});

export { UserActivityLog };
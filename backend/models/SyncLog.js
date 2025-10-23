
import { Sequelize } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * SYNC_LOG MODEL
 * Tracks synchronization history between local and cloud
 */
const SyncLog = sequelize.define('SyncLog', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  device_id: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  entity_type: {
    type: Sequelize.STRING, // 'customer', 'order', etc.
    allowNull: false,
  },
  entity_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  action: {
    type: Sequelize.ENUM('CREATE', 'UPDATE', 'DELETE'),
    allowNull: false,
  },
  sync_status: {
    type: Sequelize.ENUM('PENDING', 'SUCCESS', 'CONFLICT', 'FAILED'),
    defaultValue: 'PENDING',
  },
  conflict_resolved: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  local_timestamp: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  cloud_timestamp: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  error_message: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  tableName: 'sync_logs',
  timestamps: false,
});
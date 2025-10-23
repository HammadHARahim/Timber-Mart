// ============================================================================
// FILE: backend/models/Check.js
// Check Model - Sequelize ORM model for check tracking
// ============================================================================

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Check = sequelize.define('Check', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  check_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  payment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'payments',
      key: 'id'
    }
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  check_number: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  check_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  bank_name: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  account_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  payee_name: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  payee_type: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  cleared_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_by_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  cleared_by_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  sync_status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'SYNCED'
  },
  last_synced_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  device_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'checks',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Check;

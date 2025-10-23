// ============================================================================
// FILE: backend/models/Token.js
// Token Model - Track printed tokens with QR codes
// ============================================================================

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Token = sequelize.define('Token', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  token_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Unique token identifier'
  },

  // Related entities
  order_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'orders',
      key: 'id'
    }
  },

  customer_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'customers',
      key: 'id'
    }
  },

  project_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'projects',
      key: 'id'
    }
  },

  // Token data snapshots (for printing)
  customer_name: {
    type: DataTypes.STRING(200),
    comment: 'Customer name snapshot'
  },

  project_name: {
    type: DataTypes.STRING(200),
    comment: 'Project name snapshot'
  },

  vehicle_number: {
    type: DataTypes.STRING(50),
    comment: 'Vehicle registration number'
  },

  vehicle_type: {
    type: DataTypes.STRING(100),
    comment: 'Type of vehicle (truck, loader, etc.)'
  },

  driver_name: {
    type: DataTypes.STRING(200),
    comment: 'Driver name'
  },

  driver_phone: {
    type: DataTypes.STRING(20),
    comment: 'Driver contact number'
  },

  // Token details
  token_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Token issue date'
  },

  delivery_address: {
    type: DataTypes.TEXT,
    comment: 'Delivery address for this token'
  },

  notes: {
    type: DataTypes.TEXT,
    comment: 'Additional notes'
  },

  // QR Code data
  qr_code_data: {
    type: DataTypes.TEXT,
    comment: 'QR code content (usually token_id + order_id)'
  },

  qr_code_url: {
    type: DataTypes.STRING(500),
    comment: 'Generated QR code image URL or base64'
  },

  // Print tracking
  print_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of times printed'
  },

  last_printed_at: {
    type: DataTypes.DATE,
    comment: 'Last print timestamp'
  },

  printed_by_user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User who last printed this token'
  },

  // Template used
  template_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'print_templates',
      key: 'id'
    }
  },

  // Status
  status: {
    type: DataTypes.ENUM('ACTIVE', 'USED', 'CANCELLED'),
    defaultValue: 'ACTIVE',
    comment: 'Token status'
  },

  // User tracking
  created_by_user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },

  // Sync fields
  sync_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'SYNCED'
  },

  last_synced_at: {
    type: DataTypes.DATE
  },

  device_id: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'tokens',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['token_id']
    },
    {
      fields: ['order_id']
    },
    {
      fields: ['customer_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['token_date']
    }
  ]
});

export default Token;

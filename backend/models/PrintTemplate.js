// ============================================================================
// FILE: backend/models/PrintTemplate.js
// Print Template Model - Store custom print templates
// ============================================================================

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const PrintTemplate = sequelize.define('PrintTemplate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  template_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Unique template identifier'
  },

  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Template name'
  },

  description: {
    type: DataTypes.TEXT,
    comment: 'Template description'
  },

  type: {
    type: DataTypes.ENUM('TOKEN', 'INVOICE', 'RECEIPT', 'VOUCHER', 'CUSTOM'),
    allowNull: false,
    defaultValue: 'CUSTOM',
    comment: 'Type of template'
  },

  // Template content
  html_content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'HTML template content with placeholders'
  },

  css_content: {
    type: DataTypes.TEXT,
    comment: 'CSS styling for template'
  },

  // Print settings
  page_size: {
    type: DataTypes.STRING(20),
    defaultValue: 'A4',
    comment: 'Page size: A4, A5, THERMAL_80MM, THERMAL_58MM, LETTER'
  },

  orientation: {
    type: DataTypes.ENUM('PORTRAIT', 'LANDSCAPE'),
    defaultValue: 'PORTRAIT'
  },

  margin_top: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 10,
    comment: 'Top margin in mm'
  },

  margin_bottom: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 10,
    comment: 'Bottom margin in mm'
  },

  margin_left: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 10,
    comment: 'Left margin in mm'
  },

  margin_right: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 10,
    comment: 'Right margin in mm'
  },

  // Template metadata
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Is this the default template for its type'
  },

  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Template version number'
  },

  // User tracking
  created_by_user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },

  updated_by_user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },

  // Sync fields
  sync_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'SYNCED',
    comment: 'Sync status: SYNCED, UNSYNCED, CONFLICT'
  },

  last_synced_at: {
    type: DataTypes.DATE
  },

  device_id: {
    type: DataTypes.STRING(100),
    comment: 'Device that created/modified this record'
  }
}, {
  tableName: 'print_templates',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['template_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['is_default']
    },
    {
      fields: ['created_by_user_id']
    }
  ]
});

export default PrintTemplate;

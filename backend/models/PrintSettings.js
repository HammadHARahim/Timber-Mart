// ============================================================================
// FILE: backend/models/PrintSettings.js
// User Print Settings - Store user-specific print preferences
// ============================================================================

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const PrintSettings = sequelize.define('PrintSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User these settings belong to'
  },

  // Default template preferences
  default_token_template_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'print_templates',
      key: 'id'
    }
  },

  default_invoice_template_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'print_templates',
      key: 'id'
    }
  },

  default_receipt_template_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'print_templates',
      key: 'id'
    }
  },

  default_voucher_template_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'print_templates',
      key: 'id'
    }
  },

  // Printer preferences
  preferred_printer: {
    type: DataTypes.STRING(200),
    comment: 'Preferred printer name/ID'
  },

  printer_type: {
    type: DataTypes.ENUM('THERMAL', 'NORMAL', 'PDF'),
    defaultValue: 'NORMAL',
    comment: 'Type of printer'
  },

  thermal_printer_width: {
    type: DataTypes.INTEGER,
    defaultValue: 80,
    comment: 'Thermal printer width in mm (58 or 80)'
  },

  // Print behavior
  auto_print_on_create: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Automatically print when creating order/token'
  },

  show_print_preview: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Show preview before printing'
  },

  print_copies: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Number of copies to print'
  },

  // Page settings (for non-template specific prints)
  default_page_size: {
    type: DataTypes.STRING(20),
    defaultValue: 'A4'
  },

  default_orientation: {
    type: DataTypes.ENUM('PORTRAIT', 'LANDSCAPE'),
    defaultValue: 'PORTRAIT'
  },

  default_margin_top: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 10
  },

  default_margin_bottom: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 10
  },

  default_margin_left: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 10
  },

  default_margin_right: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 10
  },

  // QR Code settings
  include_qr_code: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Include QR code in prints'
  },

  qr_code_size: {
    type: DataTypes.INTEGER,
    defaultValue: 128,
    comment: 'QR code size in pixels'
  },

  // Company info (for headers/footers)
  company_name: {
    type: DataTypes.STRING(200)
  },

  company_address: {
    type: DataTypes.TEXT
  },

  company_phone: {
    type: DataTypes.STRING(50)
  },

  company_email: {
    type: DataTypes.STRING(100)
  },

  company_logo_url: {
    type: DataTypes.STRING(500),
    comment: 'URL or path to company logo'
  },

  // Additional preferences
  preferences: {
    type: DataTypes.JSON,
    comment: 'Additional user-specific print preferences'
  },

  // Sync fields
  sync_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'SYNCED'
  },

  last_synced_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'print_settings',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    }
  ]
});

export default PrintSettings;

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  payment_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'orders',
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
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  payment_type: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  payment_method: {
    type: DataTypes.ENUM('CASH', 'CHEQUE', 'BANK_TRANSFER', 'ONLINE', 'CHECK', 'CARD'),
    allowNull: false,
    defaultValue: 'CASH'
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  reference_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bank_name: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  check_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  check_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  account_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  approved_at: {
    type: DataTypes.DATE,
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
  approved_by_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  sync_status: {
    type: DataTypes.ENUM('SYNCED', 'UNSYNCED'),
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
  tableName: 'payments',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Payment;

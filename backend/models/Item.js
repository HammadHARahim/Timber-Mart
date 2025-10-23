import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  item_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  name_urdu: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Item name in Urdu for printing'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'piece',
    comment: 'Unit of measurement: piece, cubic_ft, kg, ton, meter, etc.'
  },
  default_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0.00,
    comment: 'Default selling price per unit'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Product category: timber, plywood, hardware, etc.'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this item is available for sale'
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Stock Keeping Unit code'
  },
  minimum_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 1,
    comment: 'Minimum order quantity'
  },
  created_by_user_id: {
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
  tableName: 'items',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['item_id']
    },
    {
      fields: ['name']
    },
    {
      fields: ['category']
    },
    {
      fields: ['is_active']
    }
  ]
});

export default Item;

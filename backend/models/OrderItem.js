import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Reference to parent order'
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    },
    comment: 'Reference to item/product'
  },
  item_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Snapshot of item name at time of order (in case item is later modified)'
  },
  item_name_urdu: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Snapshot of Urdu name for printing'
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    },
    comment: 'Quantity ordered'
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Unit of measurement (snapshot from item)'
  },
  unit_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Price per unit at time of order'
  },
  total_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Calculated: quantity * unit_price'
  },
  discount_percent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Discount percentage on this line item'
  },
  discount_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Calculated discount amount'
  },
  final_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Final amount after discount: total_price - discount_amount'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes for this line item'
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
  tableName: 'order_items',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['order_id']
    },
    {
      fields: ['item_id']
    }
  ],
  hooks: {
    // Auto-calculate total_price and final_amount before validation
    beforeValidate: (orderItem) => {
      // Calculate total price
      orderItem.total_price = parseFloat(orderItem.quantity) * parseFloat(orderItem.unit_price);

      // Calculate discount amount
      if (orderItem.discount_percent && orderItem.discount_percent > 0) {
        orderItem.discount_amount = (orderItem.total_price * parseFloat(orderItem.discount_percent)) / 100;
      } else {
        orderItem.discount_amount = 0;
      }

      // Calculate final amount
      orderItem.final_amount = orderItem.total_price - orderItem.discount_amount;
    }
  }
});

export default OrderItem;

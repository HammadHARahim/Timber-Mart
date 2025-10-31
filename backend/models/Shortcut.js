import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Shortcut = sequelize.define('Shortcut', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  shortcut_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Unique shortcut code for quick item entry'
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Quantity associated with this shortcut'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Optional description for this shortcut'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this shortcut is active'
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
  tableName: 'shortcuts',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['shortcut_code']
    },
    {
      fields: ['item_id']
    },
    {
      fields: ['is_active']
    }
  ]
});

export default Shortcut;

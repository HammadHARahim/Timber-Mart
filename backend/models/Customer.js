// ============================================================================
// FILE: backend/models/Customer.js (UPDATE - ADD deleted_at field)
// ============================================================================

import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Customer = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    customer_type: {
      type: DataTypes.STRING,
      defaultValue: "regular",
    },
    created_by_user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    sync_status: {
      type: DataTypes.ENUM("SYNCED", "UNSYNCED"),
      defaultValue: "UNSYNCED",
    },
    last_synced_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "customers",
    timestamps: false,
    indexes: [
      { fields: ["customer_id"] },
      { fields: ["name"] },
      { fields: ["phone"] },
      { fields: ["sync_status"] },
      { fields: ["created_by_user_id"] },
    ],
  }
);

export default Customer;
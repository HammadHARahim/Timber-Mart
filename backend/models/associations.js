// Model associations
import User from './User.js';
import Customer from './Customer.js';
import Order from './Order.js';
import Project from './Project.js';
import Payment from './Payment.js';
import Check from './Check.js';
import Item from './Item.js';
import OrderItem from './OrderItem.js';
import Shortcut from './Shortcut.js';
import PrintTemplate from './PrintTemplate.js';
import Token from './Token.js';
import PrintSettings from './PrintSettings.js';
import logger from '../config/logger.js';

// Define associations
const setupAssociations = () => {
  // User associations
  User.hasMany(Customer, { foreignKey: 'created_by_user_id', as: 'customers' });
  User.hasMany(Order, { foreignKey: 'created_by_user_id', as: 'createdOrders' });
  User.hasMany(Order, { foreignKey: 'updated_by_user_id', as: 'updatedOrders' });
  User.hasMany(Project, { foreignKey: 'created_by_user_id', as: 'projects' });
  User.hasMany(Payment, { foreignKey: 'created_by_user_id', as: 'payments' });
  User.hasMany(Payment, { foreignKey: 'approved_by_user_id', as: 'approved_payments' });
  User.hasMany(Item, { foreignKey: 'created_by_user_id', as: 'items' });

  // Customer associations
  Customer.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'creator' });
  Customer.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
  Customer.hasMany(Project, { foreignKey: 'customer_id', as: 'projects' });
  Customer.hasMany(Payment, { foreignKey: 'customer_id', as: 'payments' });

  // Order associations
  Order.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  Order.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
  Order.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'creator' });
  Order.belongsTo(User, { foreignKey: 'updated_by_user_id', as: 'updater' });
  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
  Order.hasMany(Payment, { foreignKey: 'order_id', as: 'payments' });

  // OrderItem associations
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  OrderItem.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

  // Item associations
  Item.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'creator' });
  Item.hasMany(OrderItem, { foreignKey: 'item_id', as: 'orderItems' });
  Item.hasMany(Shortcut, { foreignKey: 'item_id', as: 'shortcuts', onDelete: 'CASCADE' });

  // Shortcut associations
  Shortcut.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

  // Project associations
  Project.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  Project.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'creator' });
  Project.hasMany(Order, { foreignKey: 'project_id', as: 'orders' });

  // Payment associations
  Payment.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  Payment.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
  Payment.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'creator' });
  Payment.belongsTo(User, { foreignKey: 'approved_by_user_id', as: 'approver' });
  Payment.hasMany(Check, { foreignKey: 'payment_id', as: 'checks' });

  // Check associations
  Check.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' });
  Check.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  Check.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
  Check.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'creator' });
  Check.belongsTo(User, { foreignKey: 'cleared_by_user_id', as: 'clearer' });

  // Add reverse associations for checks
  Customer.hasMany(Check, { foreignKey: 'customer_id', as: 'checks' });
  Project.hasMany(Check, { foreignKey: 'project_id', as: 'checks' });
  User.hasMany(Check, { foreignKey: 'created_by_user_id', as: 'checks' });

  // PrintTemplate associations
  PrintTemplate.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'creator' });
  PrintTemplate.belongsTo(User, { foreignKey: 'updated_by_user_id', as: 'updater' });
  PrintTemplate.hasMany(Token, { foreignKey: 'template_id', as: 'tokens' });

  // Token associations
  Token.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  Token.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  Token.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
  Token.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'creator' });
  Token.belongsTo(User, { foreignKey: 'printed_by_user_id', as: 'printer' });
  Token.belongsTo(PrintTemplate, { foreignKey: 'template_id', as: 'template' });

  // Add reverse associations
  Order.hasMany(Token, { foreignKey: 'order_id', as: 'tokens' });
  Customer.hasMany(Token, { foreignKey: 'customer_id', as: 'tokens' });
  Project.hasMany(Token, { foreignKey: 'project_id', as: 'tokens' });
  User.hasMany(PrintTemplate, { foreignKey: 'created_by_user_id', as: 'printTemplates' });
  User.hasMany(Token, { foreignKey: 'created_by_user_id', as: 'tokens' });

  // PrintSettings associations
  PrintSettings.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  PrintSettings.belongsTo(PrintTemplate, { foreignKey: 'default_token_template_id', as: 'defaultTokenTemplate' });
  PrintSettings.belongsTo(PrintTemplate, { foreignKey: 'default_invoice_template_id', as: 'defaultInvoiceTemplate' });
  PrintSettings.belongsTo(PrintTemplate, { foreignKey: 'default_receipt_template_id', as: 'defaultReceiptTemplate' });
  PrintSettings.belongsTo(PrintTemplate, { foreignKey: 'default_voucher_template_id', as: 'defaultVoucherTemplate' });
  User.hasOne(PrintSettings, { foreignKey: 'user_id', as: 'printSettings' });

  logger.debug('Model associations setup complete');
};

export {
  setupAssociations,
  User,
  Customer,
  Order,
  Project,
  Payment,
  Check,
  Item,
  OrderItem,
  Shortcut,
  PrintTemplate,
  Token,
  PrintSettings
};

import { body, param, query, validationResult } from 'express-validator';
import logger from '../config/logger.js';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));

    logger.warn(`Validation failed for ${req.method} ${req.url}`);
    logger.warn('Validation errors:', JSON.stringify(errorDetails, null, 2));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorDetails
    });
  }
  next();
};

/**
 * Customer validation rules
 */
export const validateCustomer = [
  body('name')
    .trim()
    .notEmpty().withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-() ]+$/).withMessage('Invalid phone number format'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('address')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Address must not exceed 500 characters'),
  body('balance')
    .optional()
    .isFloat({ min: 0 }).withMessage('Balance must be a positive number'),
  handleValidationErrors
];

/**
 * Order validation rules
 */
export const validateOrder = [
  body('customer_id')
    .notEmpty().withMessage('Customer ID is required')
    .isInt({ min: 1 }).withMessage('Invalid customer ID'),
  body('project_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid project ID'),
  body('status')
    .optional()
    .isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']).withMessage('Invalid order status'),
  body('total_amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('items')
    .optional()
    .isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('items.*.item_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid item ID'),
  body('items.*.quantity')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
  body('items.*.unit_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  handleValidationErrors
];

/**
 * Payment validation rules
 */
export const validatePayment = [
  body('customer_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid customer ID'),
  body('project_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid project ID'),
  body('order_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid order ID'),
  body('amount')
    .notEmpty().withMessage('Payment amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('payment_type')
    .notEmpty().withMessage('Payment type is required')
    .isIn(['LOAN', 'ADVANCE', 'DEPOSIT', 'PAYMENT']).withMessage('Invalid payment type'),
  body('payment_method')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['CASH', 'CHECK', 'BANK_TRANSFER', 'ONLINE']).withMessage('Invalid payment method'),
  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
  handleValidationErrors
];

/**
 * Check validation rules
 */
export const validateCheck = [
  body('customer_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid customer ID'),
  body('project_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid project ID'),
  body('payment_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid payment ID'),
  body('check_number')
    .notEmpty().withMessage('Check number is required')
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Check number must be between 1 and 50 characters'),
  body('amount')
    .notEmpty().withMessage('Check amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('bank_name')
    .notEmpty().withMessage('Bank name is required')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Bank name must be between 2 and 100 characters'),
  body('check_date')
    .notEmpty().withMessage('Check date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('status')
    .optional()
    .isIn(['PENDING', 'CLEARED', 'BOUNCED', 'CANCELLED']).withMessage('Invalid check status'),
  handleValidationErrors
];

/**
 * Project validation rules
 */
export const validateProject = [
  body('name')
    .notEmpty().withMessage('Project name is required')
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Project name must be between 2 and 200 characters'),
  body('customer_id')
    .notEmpty().withMessage('Customer ID is required')
    .isInt({ min: 1 }).withMessage('Invalid customer ID'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).withMessage('Invalid project status'),
  body('start_date')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  body('end_date')
    .optional()
    .isISO8601().withMessage('Invalid end date format'),
  handleValidationErrors
];

/**
 * User validation rules
 */
export const validateUser = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .if(body('password').exists())
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('full_name')
    .notEmpty().withMessage('Full name is required')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['ADMIN', 'MANAGER', 'SALES_OFFICER', 'WAREHOUSE_STAFF', 'ACCOUNTANT']).withMessage('Invalid role'),
  handleValidationErrors
];

/**
 * Login validation rules
 */
export const validateLogin = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .trim(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

/**
 * ID parameter validation
 */
export const validateId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid ID parameter'),
  handleValidationErrors
];

/**
 * Pagination query validation
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

/**
 * Item validation rules
 */
export const validateItem = [
  body('name')
    .notEmpty().withMessage('Item name is required')
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
  body('category')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Category must not exceed 100 characters'),
  body('unit')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Unit must not exceed 50 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  handleValidationErrors
];

/**
 * Token validation rules
 */
export const validateToken = [
  body('order_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid order ID'),
  body('customer_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid customer ID'),
  body('project_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid project ID'),
  body('vehicle_number')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Vehicle number must not exceed 50 characters'),
  body('driver_name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Driver name must not exceed 100 characters'),
  handleValidationErrors
];

/**
 * Print template validation rules
 */
export const validateTemplate = [
  body('name')
    .notEmpty().withMessage('Template name is required')
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
  body('type')
    .notEmpty().withMessage('Template type is required')
    .isIn(['TOKEN', 'INVOICE', 'RECEIPT', 'VOUCHER']).withMessage('Invalid template type'),
  body('content')
    .notEmpty().withMessage('Template content is required')
    .trim()
    .customSanitizer(value => {
      // Sanitize HTML to prevent XSS
      return purify.sanitize(value, {
        ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'tr', 'td', 'th', 'tbody', 'thead', 'img', 'br', 'strong', 'em', 'u'],
        ALLOWED_ATTR: ['class', 'id', 'style', 'src', 'alt', 'width', 'height'],
        ALLOW_DATA_ATTR: false
      });
    }),
  body('styles')
    .optional({ checkFalsy: true })
    .trim()
    .customSanitizer(value => {
      // Remove potentially dangerous CSS
      if (!value) return value;
      return value.replace(/javascript:/gi, '').replace(/expression\s*\(/gi, '');
    }),
  handleValidationErrors
];

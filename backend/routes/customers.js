// ============================================================================
// PHASE 4: CUSTOMER MANAGEMENT - BACKEND
// ============================================================================
// File: backend/routes/customers.js
// Complete customer CRUD endpoints with validation and error handling
// ============================================================================

import express from 'express';
import { Op } from 'sequelize';
import { authenticateToken, authorize } from '../middleware/auth.js';
import  Customer  from '../models/Customer.js';
import { UserActivityLog } from '../models/UserActivityLog.js';
import { validateCustomer, validateId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// ============================================================================
// GET: Fetch all customers with pagination, filtering, and search
// ============================================================================
/**
 * GET /api/customers
 * Query params:
 *   - page: 1 (default)
 *   - limit: 10 (default)
 *   - search: "customer name or phone"
 *   - customer_type: "regular" | "new" | "premium"
 *   - sortBy: "name" | "balance" | "created_at" (default)
 *   - sortOrder: "ASC" | "DESC" (default)
 */
router.get('/', authenticateToken, validatePagination, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, customer_type, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};

    // Search by name or phone
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by customer type
    if (customer_type) {
      where.customer_type = customer_type;
    }

    // Permission check: Sales officer only sees their own customers
    if (req.user.role === 'SALES_OFFICER') {
      where.created_by_user_id = req.user.id;
    }

    // Fetch customers
    const { count, rows } = await Customer.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder]],
      attributes: [
        'id',
        'customer_id',
        'name',
        'phone',
        'email',
        'balance',
        'customer_type',
        'address',
        'created_at',
        'updated_at'
      ]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET: Fetch single customer by ID
// ============================================================================
/**
 * GET /api/customers/:id
 */
router.get('/:id', authenticateToken, validateId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Permission check
    if (req.user.role === 'SALES_OFFICER' && customer.created_by_user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this customer'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// POST: Create new customer
// ============================================================================
/**
 * POST /api/customers
 * Body:
 * {
 *   "name": "ABC Ltd",
 *   "phone": "555-1234",
 *   "email": "abc@example.com",
 *   "address": "123 Main St",
 *   "customer_type": "regular"
 * }
 */
router.post('/', authenticateToken, authorize(['customer.create']), validateCustomer, async (req, res, next) => {
  try {
    const { name, phone, email, address, customer_type } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Customer name is required'
      });
    }

    // Generate unique customer ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const customer_id = `CUST_${timestamp}_${random}`;

    // Create customer
    const customer = await Customer.create({
      customer_id,
      name: name.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      address: address?.trim() || null,
      customer_type: customer_type || 'regular',
      balance: 0,
      created_by_user_id: req.user.id,
      sync_status: 'SYNCED'
    });

    // Log activity
    // TODO: Fix deleted_at column issue in UserActivityLog
    // await UserActivityLog.create({
    //   user_id: req.user.id,
    //   action: 'CREATE_CUSTOMER',
    //   entity_type: 'customer',
    //   entity_id: customer.id,
    //   new_values: customer.toJSON()
    // });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// PUT: Update customer
// ============================================================================
/**
 * PUT /api/customers/:id
 * Body: (any fields to update)
 * {
 *   "name": "ABC Ltd Updated",
 *   "phone": "555-5678",
 *   "email": "new@example.com",
 *   "customer_type": "premium"
 * }
 */
router.put('/:id', authenticateToken, authorize(['customer.edit']), validateId, validateCustomer, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, customer_type, balance } = req.body;

    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Permission check
    if (req.user.role === 'SALES_OFFICER' && customer.created_by_user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this customer'
      });
    }

    // Store old values for activity log
    const oldValues = customer.toJSON();

    // Update fields
    if (name !== undefined) customer.name = name.trim();
    if (phone !== undefined) customer.phone = phone?.trim() || null;
    if (email !== undefined) customer.email = email?.trim() || null;
    if (address !== undefined) customer.address = address?.trim() || null;
    if (customer_type !== undefined) customer.customer_type = customer_type;
    if (balance !== undefined) customer.balance = balance;

    customer.updated_at = new Date();
    await customer.save();

    // Log activity
    // TODO: Fix deleted_at column issue
    // await UserActivityLog.create({
    //   user_id: req.user.id,
    //   action: 'UPDATE_CUSTOMER',
    //   entity_type: 'customer',
    //   entity_id: customer.id,
    //   old_values: oldValues,
    //   new_values: customer.toJSON()
    // });

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// DELETE: Soft delete customer (mark as deleted, don't remove data)
// ============================================================================
/**
 * DELETE /api/customers/:id
 */
router.delete('/:id', authenticateToken, authorize(['customer.delete']), validateId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Permission check
    if (req.user.role === 'SALES_OFFICER' && customer.created_by_user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this customer'
      });
    }

    // Soft delete - mark as deleted
    // Note: deleted_at column needs to be added to model if needed
    await customer.destroy();

    // Log activity
    // TODO: Fix deleted_at column issue
    // await UserActivityLog.create({
    //   user_id: req.user.id,
    //   action: 'DELETE_CUSTOMER',
    //   entity_type: 'customer',
    //   entity_id: customer.id,
    //   old_values: customer.toJSON()
    // });

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET: Search customers (for autocomplete, etc.)
// ============================================================================
/**
 * GET /api/customers/search?q=ABC
 */
router.get('/search/:query', authenticateToken, async (req, res, next) => {
  try {
    const { query } = req.params;

    const customers = await Customer.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { phone: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { customer_id: { [Op.iLike]: `%${query}%` } }
        ]
      },
      limit: 20,
      attributes: ['id', 'customer_id', 'name', 'phone', 'balance']
    });

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET: Customer statistics
// ============================================================================
/**
 * GET /api/customers/stats/overview
 */
router.get('/stats/overview', authenticateToken, async (req, res, next) => {
  try {
    const where = {};
    
    // Permission check
    if (req.user.role === 'SALES_OFFICER') {
      where.created_by_user_id = req.user.id;
    }

    const totalCustomers = await Customer.count({ where });
    const regularCustomers = await Customer.count({
      where: { ...where, customer_type: 'regular' }
    });
    const newCustomers = await Customer.count({
      where: { ...where, customer_type: 'new' }
    });
    const premiumCustomers = await Customer.count({
      where: { ...where, customer_type: 'premium' }
    });

    const result = await Customer.findAll({
      where,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('balance')), 'totalBalance'],
        [sequelize.fn('AVG', sequelize.col('balance')), 'avgBalance']
      ],
      raw: true
    });

    res.json({
      success: true,
      data: {
        totalCustomers,
        byType: {
          regular: regularCustomers,
          new: newCustomers,
          premium: premiumCustomers
        },
        balance: {
          total: result[0].totalBalance || 0,
          average: result[0].avgBalance || 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;






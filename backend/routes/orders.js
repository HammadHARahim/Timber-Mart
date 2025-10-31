import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { checkPermission } from '../middleware/authorize.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateOrder, validateId, validatePagination } from '../middleware/validation.js';
import orderService from '../services/orderService.js';

const router = express.Router();

// GET /api/orders - Get all orders with filtering
router.get('/', authenticateToken, checkPermission('order:view'), validatePagination, asyncHandler(async (req, res) => {
  const { search, customer_id, project_id, status, payment_status, date_from, date_to, page, limit } = req.query;

  const filters = {
    search,
    customer_id,
    project_id,
    status,
    payment_status,
    date_from,
    date_to,
    page: page || 1,
    limit: limit || 20
  };

  const result = await orderService.getAllOrders(filters);

  res.json({
    success: true,
    data: result
  });
}));

// GET /api/orders/statistics - Get order statistics
router.get('/statistics', authenticateToken, checkPermission('order:view'), asyncHandler(async (req, res) => {
  const { customer_id, project_id, date_from, date_to } = req.query;

  const filters = {
    customer_id,
    project_id,
    date_from,
    date_to
  };

  const stats = await orderService.getOrderStatistics(filters);

  res.json({
    success: true,
    data: stats
  });
}));

// GET /api/orders/:id - Get order by ID
router.get('/:id', authenticateToken, checkPermission('order:view'), validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await orderService.getOrderById(id);

  res.json({
    success: true,
    data: order
  });
}));

// POST /api/orders - Create new order
router.post('/', authenticateToken, checkPermission('order:create'), validateOrder, asyncHandler(async (req, res) => {
  const orderData = req.body;
  const userId = req.user.id;

  const order = await orderService.createOrder(orderData, userId);

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order
  });
}));

// PUT /api/orders/:id - Update order
router.put('/:id', authenticateToken, checkPermission('order:edit'), validateId, validateOrder, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orderData = req.body;
  const userId = req.user.id;

  const order = await orderService.updateOrder(id, orderData, userId);

  res.json({
    success: true,
    message: 'Order updated successfully',
    data: order
  });
}));

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', authenticateToken, checkPermission('order:edit'), validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required'
    });
  }

  const order = await orderService.updateOrderStatus(id, status, userId);

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: order
  });
}));

// DELETE /api/orders/:id - Delete order
router.delete('/:id', authenticateToken, checkPermission('order:delete'), validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await orderService.deleteOrder(id);

  res.json({
    success: true,
    message: result.message
  });
}));

export default router;

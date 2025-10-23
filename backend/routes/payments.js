// ============================================================================
// FILE: backend/routes/payments.js
// Payment routes
// ============================================================================

import express from 'express';
import paymentService from '../services/paymentService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/payments
 * Get all payments with filters
 */
router.get('/', async (req, res) => {
  try {
    const result = await paymentService.getAllPayments(req.query);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/payments/:id
 * Get payment by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/payments
 * Create new payment
 */
router.post('/', async (req, res) => {
  try {
    const payment = await paymentService.createPayment(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /api/payments/:id
 * Update payment
 */
router.put('/:id', async (req, res) => {
  try {
    const payment = await paymentService.updatePayment(req.params.id, req.body, req.user.id);
    res.json({
      success: true,
      data: payment,
      message: 'Payment updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * DELETE /api/payments/:id
 * Delete payment
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await paymentService.deletePayment(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/payments/:id/approve
 * Approve payment
 */
router.post('/:id/approve', async (req, res) => {
  try {
    const payment = await paymentService.approvePayment(req.params.id, req.user.id);
    res.json({
      success: true,
      data: payment,
      message: 'Payment approved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/payments/:id/reject
 * Reject payment
 */
router.post('/:id/reject', async (req, res) => {
  try {
    const payment = await paymentService.rejectPayment(req.params.id, req.user.id);
    res.json({
      success: true,
      data: payment,
      message: 'Payment rejected successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/payments/:id/complete
 * Mark payment as completed
 */
router.post('/:id/complete', async (req, res) => {
  try {
    const payment = await paymentService.completePayment(req.params.id);
    res.json({
      success: true,
      data: payment,
      message: 'Payment marked as completed'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/payments/:id/voucher
 * Generate payment voucher
 */
router.get('/:id/voucher', async (req, res) => {
  try {
    const voucherData = await paymentService.generateVoucher(req.params.id);
    res.json({
      success: true,
      data: voucherData
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/payments/customer/:customerId
 * Get payments by customer
 */
router.get('/customer/:customerId', async (req, res) => {
  try {
    const payments = await paymentService.getPaymentsByCustomer(req.params.customerId);
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/payments/project/:projectId
 * Get payments by project
 */
router.get('/project/:projectId', async (req, res) => {
  try {
    const payments = await paymentService.getPaymentsByProject(req.params.projectId);
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/payments/order/:orderId
 * Get payments by order
 */
router.get('/order/:orderId', async (req, res) => {
  try {
    const payments = await paymentService.getPaymentsByOrder(req.params.orderId);
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;

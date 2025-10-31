// ============================================================================
// FILE: backend/routes/checks.js
// Check routes
// ============================================================================

import express from 'express';
import checkService from '../services/checkService.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateCheck, validateId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/checks
 * Get all checks with filters
 */
router.get('/', validatePagination, async (req, res) => {
  try {
    const result = await checkService.getAllChecks(req.query);
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
 * GET /api/checks/pending
 * Get all pending checks
 */
router.get('/pending', async (req, res) => {
  try {
    const checks = await checkService.getPendingChecks();
    res.json({
      success: true,
      data: checks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/checks/overdue
 * Get overdue checks
 */
router.get('/overdue', async (req, res) => {
  try {
    const checks = await checkService.getOverdueChecks();
    res.json({
      success: true,
      data: checks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/checks/statistics
 * Get check statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const stats = await checkService.getCheckStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/checks/:id
 * Get check by ID
 */
router.get('/:id', validateId, async (req, res) => {
  try {
    const check = await checkService.getCheckById(req.params.id);
    res.json({
      success: true,
      data: check
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/checks
 * Create new check
 */
router.post('/', validateCheck, async (req, res) => {
  try {
    const check = await checkService.createCheck(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: check,
      message: 'Check created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /api/checks/:id
 * Update check
 */
router.put('/:id', validateId, validateCheck, async (req, res) => {
  try {
    const check = await checkService.updateCheck(req.params.id, req.body, req.user.id);
    res.json({
      success: true,
      data: check,
      message: 'Check updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * DELETE /api/checks/:id
 * Delete check
 */
router.delete('/:id', validateId, async (req, res) => {
  try {
    const result = await checkService.deleteCheck(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/checks/:id/clear
 * Mark check as cleared
 */
router.post('/:id/clear', validateId, async (req, res) => {
  try {
    const check = await checkService.markAsCleared(req.params.id, req.user.id);
    res.json({
      success: true,
      data: check,
      message: 'Check marked as cleared'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/checks/:id/bounce
 * Mark check as bounced
 */
router.post('/:id/bounce', validateId, async (req, res) => {
  try {
    const check = await checkService.markAsBounced(req.params.id, req.user.id);
    res.json({
      success: true,
      data: check,
      message: 'Check marked as bounced'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/checks/:id/cancel
 * Cancel check
 */
router.post('/:id/cancel', validateId, async (req, res) => {
  try {
    const check = await checkService.cancelCheck(req.params.id);
    res.json({
      success: true,
      data: check,
      message: 'Check cancelled'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/checks/customer/:customerId
 * Get checks by customer
 */
router.get('/customer/:customerId', validateId, async (req, res) => {
  try {
    const checks = await checkService.getChecksByCustomer(req.params.customerId);
    res.json({
      success: true,
      data: checks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/checks/project/:projectId
 * Get checks by project
 */
router.get('/project/:projectId', validateId, async (req, res) => {
  try {
    const checks = await checkService.getChecksByProject(req.params.projectId);
    res.json({
      success: true,
      data: checks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/checks/payment/:paymentId
 * Get checks by payment
 */
router.get('/payment/:paymentId', validateId, async (req, res) => {
  try {
    const checks = await checkService.getChecksByPayment(req.params.paymentId);
    res.json({
      success: true,
      data: checks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;

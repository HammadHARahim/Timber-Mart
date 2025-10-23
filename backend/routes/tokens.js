// ============================================================================
// FILE: backend/routes/tokens.js
// Tokens API Routes
// ============================================================================

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { checkPermission } from '../middleware/authorize.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import tokenService from '../services/tokenService.js';

const router = express.Router();

/**
 * GET /api/tokens
 * Get all tokens with filtering
 */
router.get('/', authenticateToken, checkPermission('token:view'), asyncHandler(async (req, res) => {
  const result = await tokenService.getAllTokens(req.query);
  res.json({ success: true, data: result });
}));

/**
 * GET /api/tokens/:id
 * Get token by ID
 */
router.get('/:id', authenticateToken, checkPermission('token:view'), asyncHandler(async (req, res) => {
  const token = await tokenService.getTokenById(req.params.id);
  res.json({ success: true, data: token });
}));

/**
 * GET /api/tokens/order/:orderId
 * Get tokens by order
 */
router.get('/order/:orderId', authenticateToken, checkPermission('token:view'), asyncHandler(async (req, res) => {
  const tokens = await tokenService.getTokensByOrder(req.params.orderId);
  res.json({ success: true, data: tokens });
}));

/**
 * POST /api/tokens
 * Create new token
 */
router.post('/', authenticateToken, checkPermission('token:create'), asyncHandler(async (req, res) => {
  const token = await tokenService.createToken(req.body, req.user.id);
  res.status(201).json({ success: true, data: token, message: 'Token created successfully' });
}));

/**
 * POST /api/tokens/from-order/:orderId
 * Generate token from order
 */
router.post('/from-order/:orderId', authenticateToken, checkPermission('token:create'), asyncHandler(async (req, res) => {
  const token = await tokenService.generateFromOrder(req.params.orderId, req.body, req.user.id);
  res.status(201).json({ success: true, data: token, message: 'Token generated from order successfully' });
}));

/**
 * PUT /api/tokens/:id
 * Update token
 */
router.put('/:id', authenticateToken, checkPermission('token:edit'), asyncHandler(async (req, res) => {
  const token = await tokenService.updateToken(req.params.id, req.body, req.user.id);
  res.json({ success: true, data: token, message: 'Token updated successfully' });
}));

/**
 * PATCH /api/tokens/:id/status
 * Update token status
 */
router.patch('/:id/status', authenticateToken, checkPermission('token:edit'), asyncHandler(async (req, res) => {
  const { status } = req.body;
  const token = await tokenService.updateTokenStatus(req.params.id, status);
  res.json({ success: true, data: token, message: 'Token status updated' });
}));

/**
 * PATCH /api/tokens/:id/print
 * Record token print
 */
router.patch('/:id/print', authenticateToken, checkPermission('token:print'), asyncHandler(async (req, res) => {
  const token = await tokenService.recordPrint(req.params.id, req.user.id);
  res.json({ success: true, data: token, message: 'Print recorded successfully' });
}));

/**
 * DELETE /api/tokens/:id
 * Delete token
 */
router.delete('/:id', authenticateToken, checkPermission('token:delete'), asyncHandler(async (req, res) => {
  const result = await tokenService.deleteToken(req.params.id);
  res.json({ success: true, ...result });
}));

export default router;

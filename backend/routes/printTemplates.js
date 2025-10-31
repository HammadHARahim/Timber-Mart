// ============================================================================
// FILE: backend/routes/printTemplates.js
// Print Templates API Routes
// ============================================================================

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { checkPermission } from '../middleware/authorize.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateTemplate, validateId, validatePagination } from '../middleware/validation.js';
import printTemplateService from '../services/printTemplateService.js';

const router = express.Router();

/**
 * GET /api/print-templates
 * Get all print templates with filtering
 */
router.get('/', authenticateToken, checkPermission('template:view'), validatePagination, asyncHandler(async (req, res) => {
  const result = await printTemplateService.getAllTemplates(req.query);
  res.json({ success: true, data: result });
}));

/**
 * GET /api/print-templates/:id
 * Get template by ID
 */
router.get('/:id', authenticateToken, checkPermission('template:view'), validateId, asyncHandler(async (req, res) => {
  const template = await printTemplateService.getTemplateById(req.params.id);
  res.json({ success: true, data: template });
}));

/**
 * GET /api/print-templates/default/:type
 * Get default template for a type
 */
router.get('/default/:type', authenticateToken, checkPermission('template:view'), asyncHandler(async (req, res) => {
  const template = await printTemplateService.getDefaultTemplate(req.params.type);
  res.json({ success: true, data: template });
}));

/**
 * GET /api/print-templates/:type/placeholders
 * Get available placeholders for template type
 */
router.get('/:type/placeholders', authenticateToken, checkPermission('template:view'), asyncHandler(async (req, res) => {
  const placeholders = printTemplateService.getPlaceholdersForType(req.params.type);
  res.json({ success: true, data: placeholders });
}));

/**
 * POST /api/print-templates
 * Create new template
 */
router.post('/', authenticateToken, checkPermission('template:create'), validateTemplate, asyncHandler(async (req, res) => {
  const template = await printTemplateService.createTemplate(req.body, req.user.id);
  res.status(201).json({ success: true, data: template, message: 'Template created successfully' });
}));

/**
 * PUT /api/print-templates/:id
 * Update template
 */
router.put('/:id', authenticateToken, checkPermission('template:edit'), validateId, validateTemplate, asyncHandler(async (req, res) => {
  const template = await printTemplateService.updateTemplate(req.params.id, req.body, req.user.id);
  res.json({ success: true, data: template, message: 'Template updated successfully' });
}));

/**
 * DELETE /api/print-templates/:id
 * Delete template
 */
router.delete('/:id', authenticateToken, checkPermission('template:delete'), validateId, asyncHandler(async (req, res) => {
  const result = await printTemplateService.deleteTemplate(req.params.id);
  res.json({ success: true, ...result });
}));

/**
 * PATCH /api/print-templates/:id/set-default
 * Set template as default
 */
router.patch('/:id/set-default', authenticateToken, checkPermission('template:edit'), validateId, asyncHandler(async (req, res) => {
  const template = await printTemplateService.setAsDefault(req.params.id);
  res.json({ success: true, data: template, message: 'Template set as default' });
}));

/**
 * POST /api/print-templates/:id/duplicate
 * Duplicate template
 */
router.post('/:id/duplicate', authenticateToken, checkPermission('template:create'), validateId, asyncHandler(async (req, res) => {
  const template = await printTemplateService.duplicateTemplate(req.params.id, req.user.id);
  res.status(201).json({ success: true, data: template, message: 'Template duplicated successfully' });
}));

export default router;

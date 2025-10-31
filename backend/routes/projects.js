// ============================================================================
// FILE: backend/routes/projects.js
// Project routes
// ============================================================================

import express from 'express';
import projectService from '../services/projectService.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateProject, validateId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/projects
 * Get all projects with filters
 */
router.get('/', validatePagination, async (req, res) => {
  try {
    const result = await projectService.getAllProjects(req.query);
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
 * GET /api/projects/dashboard-stats
 * Get dashboard statistics
 */
router.get('/dashboard-stats', async (req, res) => {
  try {
    const stats = await projectService.getDashboardStats();
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
 * GET /api/projects/revenue-report
 * Get revenue report
 */
router.get('/revenue-report', async (req, res) => {
  try {
    const report = await projectService.getRevenueReport(req.query);
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/projects/:id
 * Get project by ID
 */
router.get('/:id', validateId, async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/projects/:id/statistics
 * Get project statistics
 */
router.get('/:id/statistics', validateId, async (req, res) => {
  try {
    const stats = await projectService.getProjectStatistics(req.params.id);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/projects
 * Create new project
 */
router.post('/', validateProject, async (req, res) => {
  try {
    const project = await projectService.createProject(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /api/projects/:id
 * Update project
 */
router.put('/:id', validateId, validateProject, async (req, res) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    res.json({
      success: true,
      data: project,
      message: 'Project updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete project
 */
router.delete('/:id', validateId, async (req, res) => {
  try {
    const result = await projectService.deleteProject(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export default router;

// ============================================================================
// FILE: backend/routes/search.js
// Global Search routes
// ============================================================================

import express from 'express';
import searchService from '../services/searchService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/search
 * Global search across all entities
 */
router.get('/', async (req, res) => {
  try {
    const { q, entities, startDate, endDate, minAmount, maxAmount, status, searchMode, limit } = req.query;

    const filters = {
      entities: entities ? entities.split(',') : undefined,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      status,
      searchMode: searchMode || 'fuzzy',
      limit
    };

    const results = await searchService.globalSearch(q || '', filters);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to perform search'
    });
  }
});

/**
 * GET /api/search/quick-filters
 * Get quick filter presets
 */
router.get('/quick-filters', async (req, res) => {
  try {
    const quickFilters = searchService.getQuickFilters();
    res.json({
      success: true,
      data: quickFilters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;

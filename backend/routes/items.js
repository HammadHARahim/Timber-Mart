import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { checkPermission } from '../middleware/authorize.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import itemService from '../services/itemService.js';

const router = express.Router();

// GET /api/items - Get all items with filtering
router.get('/', authenticateToken, checkPermission('order:view'), asyncHandler(async (req, res) => {
  const { search, category, is_active, page, limit } = req.query;

  const filters = {
    search,
    category,
    is_active: is_active !== undefined ? is_active === 'true' : undefined,
    page: page || 1,
    limit: limit || 50
  };

  const result = await itemService.getAllItems(filters);

  res.json({
    success: true,
    data: result
  });
}));

// GET /api/items/search - Quick search for autocomplete
router.get('/search', authenticateToken, asyncHandler(async (req, res) => {
  const { q, limit } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query (q) is required'
    });
  }

  const items = await itemService.searchItems(q, limit || 10);

  res.json({
    success: true,
    data: items
  });
}));

// GET /api/items/categories - Get all categories
router.get('/categories', authenticateToken, asyncHandler(async (req, res) => {
  const categories = await itemService.getCategories();

  res.json({
    success: true,
    data: categories
  });
}));

// GET /api/items/:id - Get item by ID
router.get('/:id', authenticateToken, checkPermission('order:view'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await itemService.getItemById(id);

  res.json({
    success: true,
    data: item
  });
}));

// POST /api/items - Create new item
router.post('/', authenticateToken, checkPermission('order:create'), asyncHandler(async (req, res) => {
  const itemData = req.body;
  const userId = req.user.id;

  const item = await itemService.createItem(itemData, userId);

  res.status(201).json({
    success: true,
    message: 'Item created successfully',
    data: item
  });
}));

// POST /api/items/bulk - Bulk create items
router.post('/bulk', authenticateToken, checkPermission('order:create'), asyncHandler(async (req, res) => {
  const { items } = req.body;
  const userId = req.user.id;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      message: 'Items array is required'
    });
  }

  const createdItems = await itemService.bulkCreateItems(items, userId);

  res.status(201).json({
    success: true,
    message: `${createdItems.length} items created successfully`,
    data: createdItems
  });
}));

// PUT /api/items/:id - Update item
router.put('/:id', authenticateToken, checkPermission('order:edit'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const itemData = req.body;

  const item = await itemService.updateItem(id, itemData);

  res.json({
    success: true,
    message: 'Item updated successfully',
    data: item
  });
}));

// PATCH /api/items/:id/deactivate - Deactivate item
router.patch('/:id/deactivate', authenticateToken, checkPermission('order:edit'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await itemService.deactivateItem(id);

  res.json({
    success: true,
    message: result.message
  });
}));

// PATCH /api/items/:id/activate - Activate item
router.patch('/:id/activate', authenticateToken, checkPermission('order:edit'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await itemService.activateItem(id);

  res.json({
    success: true,
    message: result.message
  });
}));

// DELETE /api/items/:id - Delete item permanently
router.delete('/:id', authenticateToken, checkPermission('order:delete'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await itemService.deleteItem(id);

  res.json({
    success: true,
    message: result.message
  });
}));

export default router;

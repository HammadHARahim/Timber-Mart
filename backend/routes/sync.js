/**
 * SYNC ROUTES - Complete Implementation
 * Based on requirements: Phase 2-3 - Offline Sync
 */

import express from 'express';
const router = express.Router();
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import syncService from '../services/syncService.js';

// POST /api/sync/pull - Pull updates from server
router.post('/pull', authenticateToken, asyncHandler(async (req, res) => {
  const { lastSyncTimestamp, deviceId } = req.body;

  if (!deviceId) {
    return res.status(400).json({
      success: false,
      error: 'deviceId is required'
    });
  }

  const result = await syncService.pullChanges(
    deviceId,
    lastSyncTimestamp,
    req.user.id
  );

  res.json(result);
}));

// POST /api/sync/push - Push local changes to server
router.post('/push', authenticateToken, asyncHandler(async (req, res) => {
  const { changes, deviceId } = req.body;

  if (!deviceId) {
    return res.status(400).json({
      success: false,
      error: 'deviceId is required'
    });
  }

  if (!changes || typeof changes !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'changes object is required'
    });
  }

  const result = await syncService.pushChanges(
    deviceId,
    changes,
    req.user.id
  );

  res.json(result);
}));

// POST /api/sync/resolve-conflict - Resolve sync conflicts
router.post('/resolve-conflict', authenticateToken, asyncHandler(async (req, res) => {
  const { conflictId, resolution, chosenRecord } = req.body;

  if (!conflictId || !resolution) {
    return res.status(400).json({
      success: false,
      error: 'conflictId and resolution are required'
    });
  }

  const result = await syncService.resolveConflict(
    conflictId,
    resolution,
    chosenRecord
  );

  res.json(result);
}));

// GET /api/sync/status/:deviceId - Get sync status for a device
router.get('/status/:deviceId', authenticateToken, asyncHandler(async (req, res) => {
  const { deviceId } = req.params;

  const result = await syncService.getSyncStatus(deviceId);

  res.json(result);
}));

// POST /api/sync/full - Full bidirectional sync
router.post('/full', authenticateToken, asyncHandler(async (req, res) => {
  const { deviceId, lastSyncTimestamp, changes } = req.body;

  if (!deviceId) {
    return res.status(400).json({
      success: false,
      error: 'deviceId is required'
    });
  }

  // Push then pull
  const pushResult = changes && Object.keys(changes).length > 0
    ? await syncService.pushChanges(deviceId, changes, req.user.id)
    : { success: true, applied: [], conflicts: [], errors: [] };

  const pullResult = await syncService.pullChanges(
    deviceId,
    lastSyncTimestamp,
    req.user.id
  );

  res.json({
    success: true,
    push: pushResult,
    pull: pullResult,
    timestamp: new Date().toISOString()
  });
}));

export default router;

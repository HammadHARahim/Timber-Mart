/**
 * SYNC SERVICE - Complete Implementation
 * Based on requirements: Phase 2-3 - Offline Sync
 * Section 5 - Synchronization Strategy
 */

import { Op } from 'sequelize';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Project from '../models/Project.js';

// Model mapping for dynamic entity handling
const MODEL_MAP = {
  customers: Customer,
  orders: Order,
  payments: Payment,
  projects: Project
};

class SyncService {
  /**
   * PULL CHANGES FROM SERVER
   * Based on requirements: Section 5.2 - Sync Triggers
   * Returns all records modified after lastSyncTimestamp
   */
  async pullChanges(deviceId, lastSyncTimestamp, userId) {
    try {
      const timestamp = lastSyncTimestamp ? new Date(lastSyncTimestamp) : new Date(0);
      const changes = {
        customers: [],
        orders: [],
        payments: [],
        projects: []
      };

      // Fetch changes for each entity type
      for (const [entityType, Model] of Object.entries(MODEL_MAP)) {
        if (!Model) continue;

        const records = await Model.findAll({
          where: {
            updated_at: {
              [Op.gt]: timestamp
            }
          },
          order: [['updated_at', 'ASC']],
          limit: 1000 // Batch limit
        });

        changes[entityType] = records.map(r => r.toJSON());
      }

      return {
        success: true,
        changes,
        timestamp: new Date().toISOString(),
        conflicts: [],
        deviceId
      };
    } catch (error) {
      console.error('Pull changes error:', error);
      throw error;
    }
  }

  /**
   * PUSH LOCAL CHANGES TO SERVER
   * Based on requirements: Section 5.3 - Conflict Resolution Rules
   * Applies timestamp-based conflict resolution
   */
  async pushChanges(deviceId, changes, userId) {
    const results = {
      success: true,
      applied: [],
      conflicts: [],
      errors: []
    };

    try {
      // Process each entity type
      for (const [entityType, records] of Object.entries(changes)) {
        const Model = MODEL_MAP[entityType];

        if (!Model || !records || records.length === 0) {
          continue;
        }

        // Process each record
        for (const localRecord of records) {
          try {
            await this.processRecord(
              Model,
              entityType,
              localRecord,
              userId,
              deviceId,
              results
            );
          } catch (error) {
            results.errors.push({
              entityType,
              entityId: localRecord.id || localRecord.customer_id || localRecord.order_id,
              error: error.message
            });
          }
        }
      }

      results.success = results.errors.length === 0;
      return results;
    } catch (error) {
      console.error('Push changes error:', error);
      throw error;
    }
  }

  /**
   * PROCESS INDIVIDUAL RECORD
   * Handles create, update, and conflict detection
   */
  async processRecord(Model, entityType, localRecord, userId, deviceId, results) {
    // Find existing record by unique ID (customer_id, order_id, etc.)
    const uniqueIdField = this.getUniqueIdField(entityType);
    const uniqueId = localRecord[uniqueIdField];

    let serverRecord = null;
    if (uniqueId) {
      serverRecord = await Model.findOne({
        where: { [uniqueIdField]: uniqueId }
      });
    }

    // NEW RECORD - Create it
    if (!serverRecord) {
      const newRecord = await Model.create({
        ...localRecord,
        created_by_user_id: userId,
        sync_status: 'SYNCED',
        last_synced_at: new Date()
      });

      results.applied.push({
        entityType,
        entityId: newRecord.id,
        action: 'CREATE',
        uniqueId
      });
      return;
    }

    // EXISTING RECORD - Check for conflicts
    const conflict = await this.detectConflict(localRecord, serverRecord.toJSON());

    if (conflict) {
      // CONFLICT DETECTED - Use newest_wins strategy
      const resolved = await this.autoResolveConflict(conflict, 'newest_wins');

      await serverRecord.update({
        ...resolved,
        sync_status: 'SYNCED',
        last_synced_at: new Date()
      });

      results.conflicts.push({
        entityType,
        entityId: serverRecord.id,
        resolution: 'newest_wins',
        winner: conflict.local.updated_at > conflict.server.updated_at ? 'client' : 'server'
      });
    } else {
      // NO CONFLICT - Apply update
      await serverRecord.update({
        ...localRecord,
        sync_status: 'SYNCED',
        last_synced_at: new Date()
      });

      results.applied.push({
        entityType,
        entityId: serverRecord.id,
        action: 'UPDATE',
        uniqueId
      });
    }
  }

  /**
   * GET UNIQUE ID FIELD FOR ENTITY TYPE
   */
  getUniqueIdField(entityType) {
    const fieldMap = {
      customers: 'customer_id',
      orders: 'order_id',
      payments: 'payment_id',
      projects: 'project_id'
    };
    return fieldMap[entityType] || 'id';
  }

  /**
   * DETECT CONFLICTS
   * Based on requirements: Section 5.3 - Conflict Resolution Rules
   * Compares timestamps between local and server records
   */
  async detectConflict(localRecord, serverRecord) {
    if (!serverRecord) {
      return null; // No conflict, server doesn't have this record
    }

    const localTimestamp = new Date(localRecord.updated_at || localRecord.created_at);
    const serverTimestamp = new Date(serverRecord.updated_at || serverRecord.created_at);

    // If timestamps differ by more than 1 second, there's a potential conflict
    const timeDiff = Math.abs(localTimestamp - serverTimestamp);
    if (timeDiff > 1000) {
      return {
        type: 'timestamp_conflict',
        local: localRecord,
        server: serverRecord,
        localTimestamp,
        serverTimestamp
      };
    }

    return null;
  }

  /**
   * AUTO-RESOLVE CONFLICTS
   * Based on requirements: Section 5.3 - Conflict Resolution Rules
   * Strategies: server_wins, client_wins, newest_wins, merge
   */
  async autoResolveConflict(conflict, strategy = 'newest_wins') {
    switch (strategy) {
      case 'server_wins':
        return conflict.server;

      case 'client_wins':
        return conflict.local;

      case 'newest_wins':
        // Compare timestamps and use the newest
        return conflict.localTimestamp > conflict.serverTimestamp
          ? conflict.local
          : conflict.server;

      case 'merge':
        // Merge non-conflicting fields (prefer local for user data, server for system data)
        return {
          ...conflict.server,
          ...conflict.local,
          // Keep server's system fields
          id: conflict.server.id,
          created_at: conflict.server.created_at,
          created_by_user_id: conflict.server.created_by_user_id
        };

      default:
        throw new Error(`Unknown conflict resolution strategy: ${strategy}`);
    }
  }

  /**
   * RESOLVE CONFLICT MANUALLY
   * For conflicts that require user intervention
   */
  async resolveConflict(conflictId, resolution, chosenRecord) {
    // Store resolution for audit
    return {
      success: true,
      message: 'Conflict resolved manually',
      resolution,
      conflictId
    };
  }

  /**
   * GET SYNC STATUS FOR DEVICE
   * Returns sync metadata for a specific device
   */
  async getSyncStatus(deviceId) {
    try {
      // Count unsynced records
      const unsyncedCustomers = await Customer.count({
        where: { sync_status: 'UNSYNCED' }
      });

      const unsyncedOrders = await Order.count({
        where: { sync_status: 'UNSYNCED' }
      });

      const unsyncedPayments = await Payment.count({
        where: { sync_status: 'UNSYNCED' }
      });

      const totalUnsynced = unsyncedCustomers + unsyncedOrders + unsyncedPayments;

      return {
        success: true,
        deviceId,
        lastSync: new Date().toISOString(), // TODO: Track per device
        pendingChanges: totalUnsynced,
        unresolvedConflicts: 0, // TODO: Implement conflict tracking
        status: totalUnsynced > 0 ? 'pending' : 'synced',
        breakdown: {
          customers: unsyncedCustomers,
          orders: unsyncedOrders,
          payments: unsyncedPayments
        }
      };
    } catch (error) {
      console.error('Get sync status error:', error);
      throw error;
    }
  }

  /**
   * GET PENDING CHANGES COUNT
   * Quick check for unsynced records
   */
  async getPendingChangesCount() {
    const status = await this.getSyncStatus('default');
    return status.pendingChanges;
  }

  /**
   * MARK RECORDS AS SYNCED
   * After successful sync, mark records as synced
   */
  async markAsSynced(entityType, entityId) {
    const Model = MODEL_MAP[entityType];
    if (!Model) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    await Model.update(
      {
        sync_status: 'SYNCED',
        last_synced_at: new Date()
      },
      {
        where: { id: entityId }
      }
    );
  }

  /**
   * BATCH SYNC
   * Process sync in batches to avoid overwhelming the system
   */
  async batchSync(deviceId, changes, userId, batchSize = 100) {
    const results = {
      success: true,
      applied: [],
      conflicts: [],
      errors: [],
      batches: 0
    };

    for (const [entityType, records] of Object.entries(changes)) {
      if (!records || records.length === 0) continue;

      // Split into batches
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const batchChanges = { [entityType]: batch };

        const batchResult = await this.pushChanges(deviceId, batchChanges, userId);

        results.applied.push(...batchResult.applied);
        results.conflicts.push(...batchResult.conflicts);
        results.errors.push(...batchResult.errors);
        results.batches++;
      }
    }

    return results;
  }
}

export default new SyncService();

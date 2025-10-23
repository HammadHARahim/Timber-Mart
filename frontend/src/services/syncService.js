import databaseService from './databaseService';
import apiService from './apiService';
import { v4 as uuidv4 } from 'uuid';

class SyncService {
  constructor() {
    this.deviceId = this.getDeviceId();
    this.isSyncing = false;
  }

  // Get or create device ID
  getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');

    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('deviceId', deviceId);
    }

    return deviceId;
  }

  // Get last sync timestamp
  getLastSyncTimestamp() {
    return localStorage.getItem('lastSyncTimestamp');
  }

  // Set last sync timestamp
  setLastSyncTimestamp(timestamp) {
    localStorage.setItem('lastSyncTimestamp', timestamp);
  }

  // Push local changes to server
  async pushChanges() {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    try {
      this.isSyncing = true;

      // Get unsynced records from all tables
      const unsyncedCustomers = await databaseService.getUnsyncedRecords('customers');
      const unsyncedOrders = await databaseService.getUnsyncedRecords('orders');
      const unsyncedPayments = await databaseService.getUnsyncedRecords('payments');

      const changes = {
        customers: unsyncedCustomers,
        orders: unsyncedOrders,
        payments: unsyncedPayments
      };

      // Push to server
      const result = await apiService.syncPush(changes, this.deviceId);

      // Mark successfully synced records
      for (const applied of result.applied) {
        await databaseService.markAsSynced(
          applied.entityType,
          applied.entityId
        );
      }

      console.log('Push completed:', result);
      return result;
    } catch (error) {
      console.error('Push failed:', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  // Pull changes from server
  async pullChanges() {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    try {
      this.isSyncing = true;

      const lastSyncTimestamp = this.getLastSyncTimestamp();

      // Pull changes from server
      const result = await apiService.syncPull(lastSyncTimestamp, this.deviceId);

      // Apply changes to local database
      for (const [entityType, records] of Object.entries(result.changes)) {
        for (const record of records) {
          await databaseService.insert(entityType, {
            ...record,
            sync_status: 'SYNCED'
          });
        }
      }

      // Update last sync timestamp
      this.setLastSyncTimestamp(result.timestamp);

      console.log('Pull completed:', result);
      return result;
    } catch (error) {
      console.error('Pull failed:', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  // Full sync (push then pull)
  async sync() {
    try {
      // First push local changes
      await this.pushChanges();

      // Then pull server changes
      await this.pullChanges();

      return { success: true };
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  // Get pending changes count
  async getPendingChangesCount() {
    const unsyncedCustomers = await databaseService.getUnsyncedRecords('customers');
    const unsyncedOrders = await databaseService.getUnsyncedRecords('orders');
    const unsyncedPayments = await databaseService.getUnsyncedRecords('payments');

    return (
      unsyncedCustomers.length +
      unsyncedOrders.length +
      unsyncedPayments.length
    );
  }

  // Auto sync on connection restore
  setupAutoSync() {
    window.addEventListener('online', async () => {
      console.log('Connection restored, starting auto-sync...');
      try {
        await this.sync();
        console.log('Auto-sync completed');
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    });
  }
}

export default new SyncService();

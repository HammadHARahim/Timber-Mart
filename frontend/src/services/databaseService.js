// IndexedDB service for offline storage
class DatabaseService {
  constructor() {
    this.dbName = 'timber_mart_crm';
    this.version = 2; // Updated version for new stores
    this.db = null;
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('customers')) {
          const customerStore = db.createObjectStore('customers', {
            keyPath: 'id',
            autoIncrement: true
          });
          customerStore.createIndex('customer_id', 'customer_id', { unique: true });
          customerStore.createIndex('name', 'name', { unique: false });
          customerStore.createIndex('sync_status', 'sync_status', { unique: false });
        }

        if (!db.objectStoreNames.contains('orders')) {
          const orderStore = db.createObjectStore('orders', {
            keyPath: 'id',
            autoIncrement: true
          });
          orderStore.createIndex('order_id', 'order_id', { unique: true });
          orderStore.createIndex('customer_id', 'customer_id', { unique: false });
          orderStore.createIndex('sync_status', 'sync_status', { unique: false });
        }

        if (!db.objectStoreNames.contains('payments')) {
          const paymentStore = db.createObjectStore('payments', {
            keyPath: 'id',
            autoIncrement: true
          });
          paymentStore.createIndex('payment_id', 'payment_id', { unique: true });
          paymentStore.createIndex('customer_id', 'customer_id', { unique: false });
          paymentStore.createIndex('sync_status', 'sync_status', { unique: false });
        }

        // Items store for product catalog
        if (!db.objectStoreNames.contains('items')) {
          const itemStore = db.createObjectStore('items', {
            keyPath: 'id',
            autoIncrement: true
          });
          itemStore.createIndex('item_id', 'item_id', { unique: true });
          itemStore.createIndex('name', 'name', { unique: false });
          itemStore.createIndex('category', 'category', { unique: false });
          itemStore.createIndex('is_active', 'is_active', { unique: false });
          itemStore.createIndex('sync_status', 'sync_status', { unique: false });
        }

        // Order items store for order line items
        if (!db.objectStoreNames.contains('order_items')) {
          const orderItemStore = db.createObjectStore('order_items', {
            keyPath: 'id',
            autoIncrement: true
          });
          orderItemStore.createIndex('order_id', 'order_id', { unique: false });
          orderItemStore.createIndex('item_id', 'item_id', { unique: false });
        }

        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', {
            keyPath: 'id',
            autoIncrement: true
          });
          projectStore.createIndex('project_id', 'project_id', { unique: true });
          projectStore.createIndex('customer_id', 'customer_id', { unique: false });
          projectStore.createIndex('sync_status', 'sync_status', { unique: false });
        }

        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', {
            keyPath: 'id',
            autoIncrement: true
          });
        }

        console.log('Database schema created');
      };
    });
  }

  // Generic query method
  async query(storeName, filters = {}) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result;

        // Apply filters
        if (Object.keys(filters).length > 0) {
          results = results.filter((item) => {
            return Object.entries(filters).every(([key, value]) => {
              return item[key] === value;
            });
          });
        }

        resolve(results);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Insert record
  async insert(storeName, data) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      // Add sync metadata
      const record = {
        ...data,
        sync_status: 'UNSYNCED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const request = store.add(record);

      request.onsuccess = () => {
        resolve({ ...record, id: request.result });
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Update record
  async update(storeName, id, data) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const record = getRequest.result;

        if (!record) {
          reject(new Error('Record not found'));
          return;
        }

        const updatedRecord = {
          ...record,
          ...data,
          sync_status: 'UNSYNCED',
          updated_at: new Date().toISOString()
        };

        const putRequest = store.put(updatedRecord);

        putRequest.onsuccess = () => {
          resolve(updatedRecord);
        };

        putRequest.onerror = () => {
          reject(putRequest.error);
        };
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  }

  // Delete record
  async delete(storeName, id) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve({ success: true });
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get unsynced records
  async getUnsyncedRecords(storeName) {
    return this.query(storeName, { sync_status: 'UNSYNCED' });
  }

  // Mark record as synced
  async markAsSynced(storeName, id) {
    return this.update(storeName, id, {
      sync_status: 'SYNCED',
      last_synced_at: new Date().toISOString()
    });
  }

  // Clear all data
  async clearAll() {
    if (!this.db) {
      await this.init();
    }

    const storeNames = ['customers', 'orders', 'payments', 'items', 'order_items', 'projects', 'sync_queue'];

    for (const storeName of storeNames) {
      await new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}

export default new DatabaseService();

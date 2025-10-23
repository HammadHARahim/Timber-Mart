import { createContext, useContext, useState, useCallback } from 'react';
import syncService from '../services/syncService';

const SyncContext = createContext(null);

export function SyncProvider({ children }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [pendingChanges, setPendingChanges] = useState(0);

  const syncData = useCallback(async () => {
    try {
      setIsSyncing(true);
      await syncService.sync();
      setLastSyncTime(new Date());

      // Update pending changes count
      const count = await syncService.getPendingChangesCount();
      setPendingChanges(count);
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const updatePendingCount = useCallback(async () => {
    const count = await syncService.getPendingChangesCount();
    setPendingChanges(count);
  }, []);

  return (
    <SyncContext.Provider
      value={{
        isSyncing,
        lastSyncTime,
        pendingChanges,
        syncData,
        updatePendingCount
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}

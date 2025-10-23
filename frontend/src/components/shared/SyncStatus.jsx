import { useOffline } from '../../context/OfflineContext';

export default function SyncStatus() {
  const { isOnline } = useOffline();

  return (
    <div className={`sync-status ${isOnline ? 'online' : 'offline'}`}>
      <span className="status-indicator"></span>
      <span className="status-text">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}

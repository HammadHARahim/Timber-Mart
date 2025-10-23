import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      type: notification.type || 'info', // success, error, warning, info
      message: notification.message,
      duration: notification.duration || 3000
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const success = useCallback((message, duration) => {
    return addNotification({ type: 'success', message, duration });
  }, [addNotification]);

  const error = useCallback((message, duration) => {
    return addNotification({ type: 'error', message, duration });
  }, [addNotification]);

  const warning = useCallback((message, duration) => {
    return addNotification({ type: 'warning', message, duration });
  }, [addNotification]);

  const info = useCallback((message, duration) => {
    return addNotification({ type: 'info', message, duration });
  }, [addNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        warning,
        info,
        clearAll
      }}
    >
      {children}
      <NotificationList notifications={notifications} onClose={removeNotification} />
    </NotificationContext.Provider>
  );
}

// Notification display component
function NotificationList({ notifications, onClose }) {
  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <span className="notification-message">{notification.message}</span>
          <button
            className="notification-close"
            onClick={() => onClose(notification.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

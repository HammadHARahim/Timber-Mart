import { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import styles from '../../styles/MainLayout.module.css';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const { isOnline } = useOffline();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={styles.mainLayout}>
      <header className={styles.appHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.hamburgerBtn} onClick={toggleSidebar} aria-label="Toggle sidebar">
            <span className={`${styles.hamburger} ${sidebarOpen ? styles.open : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <h1>Timber Mart CRM</h1>
        </div>
        <div className={styles.headerRight}>
          <span className={`${styles.status} ${isOnline ? styles.online : styles.offline}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <span className={styles.userInfo}>
            {user?.full_name || user?.username}
          </span>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      <div className={styles.appContainer}>
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
          <nav className={styles.sidebarNav}>
            <Link
              to="/"
              className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>📊</span>
              <span className={styles.navText}>Dashboard</span>
            </Link>
            <Link
              to="/customers"
              className={`${styles.navLink} ${isActive('/customers') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>👥</span>
              <span className={styles.navText}>Customers</span>
            </Link>
            <Link
              to="/orders"
              className={`${styles.navLink} ${isActive('/orders') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>📦</span>
              <span className={styles.navText}>Orders</span>
            </Link>
            <Link
              to="/payments"
              className={`${styles.navLink} ${isActive('/payments') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>💰</span>
              <span className={styles.navText}>Payments</span>
            </Link>
            <Link
              to="/checks"
              className={`${styles.navLink} ${isActive('/checks') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>📋</span>
              <span className={styles.navText}>Checks</span>
            </Link>
            <Link
              to="/projects"
              className={`${styles.navLink} ${isActive('/projects') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>🏗️</span>
              <span className={styles.navText}>Projects</span>
            </Link>
            <Link
              to="/tokens"
              className={`${styles.navLink} ${isActive('/tokens') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>🎫</span>
              <span className={styles.navText}>Tokens</span>
            </Link>
            <Link
              to="/templates"
              className={`${styles.navLink} ${isActive('/templates') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>📄</span>
              <span className={styles.navText}>Templates</span>
            </Link>
            <Link
              to="/reports"
              className={`${styles.navLink} ${isActive('/reports') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>📈</span>
              <span className={styles.navText}>Reports</span>
            </Link>
            {user?.role === 'ADMIN' && (
              <>
                <div className={styles.navDivider}></div>
                <Link
                  to="/users"
                  className={`${styles.navLink} ${isActive('/users') ? styles.active : ''}`}
                >
                  <span className={styles.navIcon}>👤</span>
                  <span className={styles.navText}>Users</span>
                </Link>
                <Link
                  to="/print-settings"
                  className={`${styles.navLink} ${isActive('/print-settings') ? styles.active : ''}`}
                >
                  <span className={styles.navIcon}>🖨️</span>
                  <span className={styles.navText}>Print Settings</span>
                </Link>
                <Link
                  to="/settings"
                  className={`${styles.navLink} ${isActive('/settings') ? styles.active : ''}`}
                >
                  <span className={styles.navIcon}>⚙️</span>
                  <span className={styles.navText}>Settings</span>
                </Link>
              </>
            )}
          </nav>
        </aside>

        <main className={`${styles.mainContent} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={toggleSidebar}></div>
      )}
    </div>
  );
}

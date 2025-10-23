import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import styles from '../styles/Dashboard.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    totalPayments: 0,
    totalOrders: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await projectService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₨${parseFloat(amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.welcomeSection}>
        <h2>Welcome back, {user.full_name || user.username}!</h2>
        <p className={styles.subtitle}>Here's what's happening with your business today.</p>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading dashboard...</div>
      ) : (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.customers}`}>👥</div>
            <div className={styles.statInfo}>
              <h3>Total Customers</h3>
              <p className={styles.statValue}>{stats.totalCustomers}</p>
              <p className={styles.statChange}>View all customers</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.orders}`}>📦</div>
            <div className={styles.statInfo}>
              <h3>Total Orders</h3>
              <p className={styles.statValue}>{stats.totalOrders}</p>
              <p className={styles.statChange}>Manage orders</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.revenue}`}>💰</div>
            <div className={styles.statInfo}>
              <h3>Total Payments</h3>
              <p className={styles.statValue}>{formatCurrency(stats.totalPayments)}</p>
              <p className={styles.statChange}>View reports</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.projects}`}>🏗️</div>
            <div className={styles.statInfo}>
              <h3>Total Projects</h3>
              <p className={styles.statValue}>{stats.totalProjects}</p>
              <p className={styles.statChange}>{stats.activeProjects} active, {stats.completedProjects} completed</p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.userInfoCard}>
        <h3>Your Account</h3>
        <div className={styles.infoRow}>
          <span className={styles.label}>Role:</span>
          <span className={styles.value}>{user.role}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Email:</span>
          <span className={styles.value}>{user.email}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Department:</span>
          <span className={styles.value}>{user.department || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}

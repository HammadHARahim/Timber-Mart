import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import UserList from '../components/features/UserList';
import UserForm from '../components/features/UserForm';
import styles from '../styles/UsersPage.module.css';

/**
 * USERS PAGE
 * Based on requirements: Phase 10 - User Management & Admin Panel
 * Section 12.3 - User Management Features
 */

export default function UsersPage() {
  const { user: currentUser, hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Check if user has permission to manage users (Admin only)
  if (!hasPermission('user.create') && currentUser?.role !== 'ADMIN') {
    return (
      <div className={styles.usersPage}>
        <div className={styles.accessDenied}>
          <h2>Access Denied</h2>
          <p>You don't have permission to manage users.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingUser(null);
    fetchUsers();
  };

  if (loading) {
    return (
      <div className={styles.usersPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.usersPage}>
        <div className={styles.errorContainer}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchUsers}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.usersPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1>User Management</h1>
          <p>Manage system users, roles, and permissions</p>
        </div>
        <button
          onClick={handleCreateUser}
          className={styles.btnAddUser}
        >
          + Add New User
        </button>
      </div>

      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <UserForm
              user={editingUser}
              onClose={handleFormClose}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      )}

      <UserList
        users={users}
        onEdit={handleEditUser}
        onRefresh={fetchUsers}
      />

      <div className={styles.infoBox}>
        <h3>User Roles & Permissions</h3>
        <ul>
          <li><strong>ADMIN:</strong> Full system access, user management</li>
          <li><strong>MANAGER:</strong> Team management, approvals, reports</li>
          <li><strong>SALES_OFFICER:</strong> Customer and order management</li>
          <li><strong>WAREHOUSE_STAFF:</strong> Inventory and fulfillment</li>
          <li><strong>ACCOUNTANT:</strong> Financial operations and reports</li>
        </ul>
      </div>
    </div>
  );
}

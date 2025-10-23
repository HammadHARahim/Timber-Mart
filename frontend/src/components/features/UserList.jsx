import { useState } from 'react';
import styles from '../../styles/UserList.module.css';

/**
 * USER LIST COMPONENT
 * Based on requirements: Section 12.8 - User Management UI Components
 */

export default function UserList({ users, onEdit, onRefresh }) {
  const [selectedUser, setSelectedUser] = useState(null);

  const getRoleBadgeClass = (role) => {
    const classes = {
      ADMIN: 'admin',
      MANAGER: 'manager',
      SALES_OFFICER: 'salesOfficer',
      WAREHOUSE_STAFF: 'warehouseStaff',
      ACCOUNTANT: 'accountant'
    };
    return classes[role] || 'manager';
  };

  const handleToggleStatus = async (user) => {
    if (!confirm(`Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} ${user.username}?`)) {
      return;
    }

    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          is_active: !user.is_active
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      onRefresh();
    } catch (error) {
      alert('Error updating user status: ' + error.message);
    }
  };

  if (users.length === 0) {
    return (
      <div className={styles.userList}>
        <div className={styles.noUsers}>
          <p>No users found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.userList}>
      <table className={styles.usersTable}>
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Department</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    <span>
                      {user.username.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.userDetails}>
                    <div className={styles.userName}>
                      {user.full_name || user.username}
                    </div>
                    <div className={styles.userEmail}>{user.email}</div>
                  </div>
                </div>
              </td>
              <td>
                <span className={`${styles.roleBadge} ${styles[getRoleBadgeClass(user.role)]}`}>
                  {user.role.replace('_', ' ')}
                </span>
              </td>
              <td>
                <span className={styles.departmentText}>
                  {user.department || '-'}
                </span>
              </td>
              <td>
                <span className={`${styles.statusBadge} ${user.is_active ? styles.active : styles.inactive}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <span className={styles.dateText}>
                  {user.last_login
                    ? new Date(user.last_login).toLocaleDateString()
                    : 'Never'}
                </span>
              </td>
              <td>
                <div className={styles.actions}>
                  <button
                    onClick={() => onEdit(user)}
                    className={`${styles.btnAction} ${styles.edit}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(user)}
                    className={`${styles.btnAction} ${user.is_active ? styles.deactivate : styles.activate}`}
                  >
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

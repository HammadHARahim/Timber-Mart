import { useState, useEffect } from 'react';
import styles from '../../styles/UserForm.module.css';

/**
 * USER FORM COMPONENT
 * Based on requirements: Section 12.3 - User Creation Flow
 */

const ROLES = [
  { value: 'ADMIN', label: 'Admin', description: 'Full system access' },
  { value: 'MANAGER', label: 'Manager', description: 'Team management, approvals' },
  { value: 'SALES_OFFICER', label: 'Sales Officer', description: 'Customer and order management' },
  { value: 'WAREHOUSE_STAFF', label: 'Warehouse Staff', description: 'Inventory and fulfillment' },
  { value: 'ACCOUNTANT', label: 'Accountant', description: 'Financial operations' }
];

export default function UserForm({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'SALES_OFFICER',
    department: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email || '',
        full_name: user.full_name || '',
        password: '', // Don't populate password for editing
        role: user.role,
        department: user.department || '',
        is_active: user.is_active
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    if (!user && !formData.password) {
      setError('Password is required for new users');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');

      const endpoint = user
        ? `${import.meta.env.VITE_API_URL}/api/auth/users/${user.id}`
        : `${import.meta.env.VITE_API_URL}/api/auth/users`;

      const method = user ? 'PUT' : 'POST';

      // Only send password if it's set
      const payload = { ...formData };
      if (!payload.password) {
        delete payload.password;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save user');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.userForm}>
      <div className={styles.formHeader}>
        <h2>{user ? 'Edit User' : 'Create New User'}</h2>
        <p>{user ? 'Update user information and permissions' : 'Add a new user to the system'}</p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>
            Username <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={!!user}
            placeholder="Enter username"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Full Name</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Enter full name"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="user@example.com"
          />
        </div>

        <div className={styles.formGroup}>
          <label>
            Password {!user && <span className={styles.required}>*</span>}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={user ? 'Leave blank to keep current password' : 'Enter password'}
            required={!user}
            minLength={6}
          />
          <p className={styles.helperText}>
            {user ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
          </p>
        </div>

        <div className={styles.formGroup}>
          <label>
            Role <span className={styles.required}>*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            {ROLES.map(role => (
              <option key={role.value} value={role.value}>
                {role.label} - {role.description}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Department</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="e.g., Sales, Warehouse, Accounts"
          />
        </div>

        {user && (
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            <label htmlFor="is_active">
              User is active
            </label>
          </div>
        )}

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.btnCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`btn-submit ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
          </button>
        </div>
      </form>
    </div>
  );
}

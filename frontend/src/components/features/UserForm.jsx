// ============================================================================
// User Form - Material UI Version
// Based on requirements: Section 12.3 - User Creation Flow
// ============================================================================

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper,
  Alert,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

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
    <Paper elevation={0} sx={{ maxWidth: 600, width: '100%' }}>
      {/* Form Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          {user ? (
            <EditIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          ) : (
            <PersonAddIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          )}
          <Typography variant="h5" fontWeight={700}>
            {user ? 'Edit User' : 'Create New User'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {user ? 'Update user information and permissions' : 'Add a new user to the system'}
        </Typography>
      </Box>

      <Divider />

      {/* Error Alert */}
      {error && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Username */}
          <TextField
            fullWidth
            required
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={!!user || loading}
            placeholder="Enter username"
            helperText={user ? 'Username cannot be changed' : 'Unique identifier for login'}
          />

          {/* Full Name */}
          <TextField
            fullWidth
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            disabled={loading}
            placeholder="Enter full name"
          />

          {/* Email */}
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            placeholder="user@example.com"
          />

          {/* Password */}
          <TextField
            fullWidth
            required={!user}
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            placeholder={user ? 'Leave blank to keep current password' : 'Enter password'}
            helperText={user ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
            inputProps={{ minLength: 6 }}
          />

          {/* Role */}
          <TextField
            fullWidth
            required
            select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
            helperText="Select the user's role and access level"
          >
            {ROLES.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {role.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {role.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>

          {/* Department */}
          <TextField
            fullWidth
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            disabled={loading}
            placeholder="e.g., Sales, Warehouse, Accounts"
          />

          {/* Active Status Checkbox (only for editing) */}
          {user && (
            <Box sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_active}
                    onChange={handleChange}
                    name="is_active"
                    disabled={loading}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      User is active
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Inactive users cannot log in to the system
                    </Typography>
                  </Box>
                }
              />
            </Box>
          )}
        </Box>

        {/* Form Actions */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            startIcon={<CancelIcon />}
            size="large"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            size="large"
          >
            {loading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

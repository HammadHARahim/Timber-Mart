// ============================================================================
// Customer Form - Material UI Version
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
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

export default function CustomerForm({ customer, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    customer_type: 'regular'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with customer data if editing
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        customer_type: customer.customer_type || 'regular'
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        customer_type: 'regular'
      });
    }
    setErrors({});
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Customer name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.phone && formData.phone.trim().length < 5) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        phone: formData.phone.trim() || '',
        email: formData.email.trim() || '',
        address: formData.address.trim() || '',
        customer_type: formData.customer_type
      });
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save customer' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      customer_type: 'regular'
    });
    setErrors({});
    onCancel();
  };

  return (
    <Paper elevation={0} sx={{ maxWidth: 600, width: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          {customer ? (
            <EditIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          ) : (
            <PersonAddIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          )}
          <Typography variant="h5" fontWeight={700}>
            {customer ? 'Edit Customer' : 'Create New Customer'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {customer
            ? 'Update customer information and details'
            : 'Add a new customer to the system'}
        </Typography>
      </Box>

      <Divider />

      {/* Error Alert */}
      {errors.submit && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Alert severity="error" onClose={() => setErrors(prev => ({ ...prev, submit: '' }))}>
            {errors.submit}
          </Alert>
        </Box>
      )}

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Name Field */}
          <TextField
            fullWidth
            required
            label="Customer Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name || 'Full name of the customer'}
            disabled={loading || isSubmitting}
          />

          {/* Phone */}
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={!!errors.phone}
            helperText={errors.phone || 'Contact number (e.g., +92 300 1234567)'}
            disabled={loading || isSubmitting}
          />

          {/* Email */}
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email || 'Email for communication'}
            disabled={loading || isSubmitting}
          />

          {/* Address */}
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            multiline
            rows={3}
            disabled={loading || isSubmitting}
            helperText="Complete address including street, city, and area"
          />

          {/* Customer Type */}
          <TextField
            fullWidth
            select
            label="Customer Type"
            name="customer_type"
            value={formData.customer_type}
            onChange={handleChange}
            disabled={loading || isSubmitting}
            helperText="Category to organize and manage customers"
          >
            <MenuItem value="regular">
              <Box>
                <Typography variant="body2" fontWeight={600}>Regular</Typography>
                <Typography variant="caption" color="text.secondary">
                  Standard customer with regular pricing
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="new">
              <Box>
                <Typography variant="body2" fontWeight={600}>New</Typography>
                <Typography variant="caption" color="text.secondary">
                  First-time customer
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="premium">
              <Box>
                <Typography variant="body2" fontWeight={600}>Premium</Typography>
                <Typography variant="caption" color="text.secondary">
                  VIP customer with special benefits
                </Typography>
              </Box>
            </MenuItem>
          </TextField>
        </Box>

        {/* Form Actions */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={loading || isSubmitting}
            startIcon={<CancelIcon />}
            size="large"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || isSubmitting}
            startIcon={isSubmitting || loading ? <CircularProgress size={20} /> : <SaveIcon />}
            size="large"
          >
            {isSubmitting || loading
              ? 'Saving...'
              : (customer ? 'Update Customer' : 'Create Customer')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

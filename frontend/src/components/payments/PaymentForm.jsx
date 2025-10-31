// ============================================================================
// Payment Form - Material UI Version
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
  Autocomplete,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { api } from '../../utils/apiClient';

export default function PaymentForm({ payment, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    customer_id: '',
    amount: '',
    payment_type: 'ADVANCE',
    payment_method: 'CASH',
    description: '',
    status: 'PENDING'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Set form data when editing
  useEffect(() => {
    if (payment) {
      setFormData({
        customer_id: payment.customer_id || '',
        amount: payment.amount || '',
        payment_type: payment.payment_type || 'ADVANCE',
        payment_method: payment.payment_method || 'CASH',
        description: payment.description || '',
        status: payment.status || 'PENDING'
      });

      // Set selected customer if editing
      if (payment.customer_id && customers.length > 0) {
        const customer = customers.find(c => c.id === payment.customer_id);
        setSelectedCustomer(customer || null);
      }
    }
  }, [payment, customers]);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await api.get('/api/customers');
      if (response.success) {
        setCustomers(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate customer_id
    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer ID is required';
    }

    // Validate amount
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    // Validate payment_type
    if (!formData.payment_type) {
      newErrors.payment_type = 'Payment type is required';
    }

    // Validate payment_method
    if (!formData.payment_method) {
      newErrors.payment_method = 'Payment method is required';
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
      await onSubmit(formData);
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save payment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ maxWidth: 600, width: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          {payment ? (
            <EditIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          ) : (
            <AddIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          )}
          <Typography variant="h5" fontWeight={700}>
            {payment ? 'Edit Payment' : 'Record New Payment'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {payment
            ? 'Update payment information and details'
            : 'Add a new payment transaction'}
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
          {/* Customer Selection */}
          <Autocomplete
            fullWidth
            options={customers}
            loading={loadingCustomers}
            value={selectedCustomer}
            onChange={(event, newValue) => {
              setSelectedCustomer(newValue);
              setFormData(prev => ({
                ...prev,
                customer_id: newValue ? newValue.id : ''
              }));
              if (errors.customer_id) {
                setErrors(prev => ({ ...prev, customer_id: '' }));
              }
            }}
            getOptionLabel={(option) => `${option.name} (${option.customer_id})`}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {option.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {option.customer_id} • Phone: {option.phone || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Customer"
                error={!!errors.customer_id}
                helperText={errors.customer_id || "Search by customer name or ID"}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingCustomers ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            disabled={isSubmitting}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />

          {/* Amount */}
          <TextField
            fullWidth
            required
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            disabled={isSubmitting}
            error={!!errors.amount}
            inputProps={{ step: '0.01' }}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>₨</Typography>,
            }}
            helperText={errors.amount || "Payment amount in rupees"}
          />

          {/* Payment Type */}
          <TextField
            fullWidth
            select
            label="Payment Type"
            name="payment_type"
            value={formData.payment_type}
            onChange={handleChange}
            disabled={isSubmitting}
            error={!!errors.payment_type}
            helperText={errors.payment_type || "Category of the payment"}
          >
            <MenuItem value="LOAN">
              <Box>
                <Typography variant="body2" fontWeight={600}>Loan</Typography>
                <Typography variant="caption" color="text.secondary">
                  Customer taking a loan
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="ADVANCE">
              <Box>
                <Typography variant="body2" fontWeight={600}>Advance</Typography>
                <Typography variant="caption" color="text.secondary">
                  Advance payment for future order
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="DEPOSIT">
              <Box>
                <Typography variant="body2" fontWeight={600}>Deposit</Typography>
                <Typography variant="caption" color="text.secondary">
                  Security or initial deposit
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="ORDER_PAYMENT">
              <Box>
                <Typography variant="body2" fontWeight={600}>Order Payment</Typography>
                <Typography variant="caption" color="text.secondary">
                  Payment for a specific order
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="REFUND">
              <Box>
                <Typography variant="body2" fontWeight={600}>Refund</Typography>
                <Typography variant="caption" color="text.secondary">
                  Refunding customer's payment
                </Typography>
              </Box>
            </MenuItem>
          </TextField>

          {/* Payment Method */}
          <TextField
            fullWidth
            select
            label="Payment Method"
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            disabled={isSubmitting}
            error={!!errors.payment_method}
            helperText={errors.payment_method || "How the payment was received"}
          >
            <MenuItem value="CASH">
              <Box>
                <Typography variant="body2" fontWeight={600}>Cash</Typography>
                <Typography variant="caption" color="text.secondary">
                  Physical cash payment
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="CHECK">
              <Box>
                <Typography variant="body2" fontWeight={600}>Check</Typography>
                <Typography variant="caption" color="text.secondary">
                  Payment via cheque
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="BANK_TRANSFER">
              <Box>
                <Typography variant="body2" fontWeight={600}>Bank Transfer</Typography>
                <Typography variant="caption" color="text.secondary">
                  Direct bank transfer
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="CARD">
              <Box>
                <Typography variant="body2" fontWeight={600}>Card</Typography>
                <Typography variant="caption" color="text.secondary">
                  Credit or debit card payment
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="ONLINE">
              <Box>
                <Typography variant="body2" fontWeight={600}>Online</Typography>
                <Typography variant="caption" color="text.secondary">
                  Online payment gateway
                </Typography>
              </Box>
            </MenuItem>
          </TextField>

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            disabled={isSubmitting}
            helperText="Additional notes or details about this payment"
          />
        </Box>

        {/* Form Actions */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isSubmitting}
            startIcon={<CancelIcon />}
            size="large"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
            size="large"
          >
            {isSubmitting
              ? 'Saving...'
              : (payment ? 'Update Payment' : 'Record Payment')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

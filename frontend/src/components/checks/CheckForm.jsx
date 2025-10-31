// ============================================================================
// Check Form - Material UI Version
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

export default function CheckForm({ check, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    customer_id: '',
    check_number: '',
    amount: '',
    check_date: '',
    bank_name: '',
    payee_name: '',
    payee_type: 'CUSTOMER',
    notes: ''
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
    if (check) {
      setFormData({
        customer_id: check.customer_id || '',
        check_number: check.check_number || '',
        amount: check.amount || '',
        check_date: check.check_date || '',
        bank_name: check.bank_name || '',
        payee_name: check.payee_name || '',
        payee_type: check.payee_type || 'CUSTOMER',
        notes: check.notes || ''
      });

      // Set selected customer if editing and payee is customer
      if (check.customer_id && check.payee_type === 'CUSTOMER' && customers.length > 0) {
        const customer = customers.find(c => c.id === check.customer_id);
        setSelectedCustomer(customer || null);
      }
    }
  }, [check, customers]);

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

    // Handle payee_type changes
    if (name === 'payee_type') {
      if (value !== 'CUSTOMER') {
        // Clear selected customer if changing away from CUSTOMER
        setSelectedCustomer(null);
        setFormData(prev => ({ ...prev, customer_id: '' }));
      } else {
        // Clear payee_name when changing to CUSTOMER (will use customer name)
        setFormData(prev => ({ ...prev, payee_name: '' }));
      }
    }

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate check_number
    if (!formData.check_number) {
      newErrors.check_number = 'Check number is required';
    }

    // Validate check_date
    if (!formData.check_date) {
      newErrors.check_date = 'Check date is required';
    }

    // Validate amount
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    // Validate bank_name
    if (!formData.bank_name) {
      newErrors.bank_name = 'Bank name is required';
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
      setErrors({ submit: err.message || 'Failed to save check' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ maxWidth: 600, width: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          {check ? (
            <EditIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          ) : (
            <AddIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          )}
          <Typography variant="h5" fontWeight={700}>
            {check ? 'Edit Check' : 'Add New Check'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {check
            ? 'Update check information and details'
            : 'Record a new check transaction'}
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
          {/* Check Number */}
          <TextField
            fullWidth
            required
            label="Check Number"
            name="check_number"
            value={formData.check_number}
            onChange={handleChange}
            disabled={isSubmitting}
            error={!!errors.check_number}
            helperText={errors.check_number || "Unique number printed on the check"}
          />

          {/* Check Date */}
          <TextField
            fullWidth
            required
            label="Check Date"
            name="check_date"
            type="date"
            value={formData.check_date}
            onChange={handleChange}
            disabled={isSubmitting}
            error={!!errors.check_date}
            InputLabelProps={{ shrink: true }}
            helperText={errors.check_date || "Date written on the check"}
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
            helperText={errors.amount || "Amount in rupees"}
          />

          {/* Bank Name */}
          <TextField
            fullWidth
            required
            label="Bank Name"
            name="bank_name"
            value={formData.bank_name}
            onChange={handleChange}
            disabled={isSubmitting}
            error={!!errors.bank_name}
            helperText={errors.bank_name || "Name of the issuing bank"}
          />

          {/* Payee Type */}
          <TextField
            fullWidth
            select
            label="Payee Type"
            name="payee_type"
            value={formData.payee_type}
            onChange={handleChange}
            disabled={isSubmitting}
            helperText="Category of the payee"
          >
            <MenuItem value="CUSTOMER">
              <Box>
                <Typography variant="body2" fontWeight={600}>Customer</Typography>
                <Typography variant="caption" color="text.secondary">
                  Payment to a customer
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="SUPPLIER">
              <Box>
                <Typography variant="body2" fontWeight={600}>Supplier</Typography>
                <Typography variant="caption" color="text.secondary">
                  Payment to a supplier or vendor
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="EMPLOYEE">
              <Box>
                <Typography variant="body2" fontWeight={600}>Employee</Typography>
                <Typography variant="caption" color="text.secondary">
                  Payment to an employee
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="OTHER">
              <Box>
                <Typography variant="body2" fontWeight={600}>Other</Typography>
                <Typography variant="caption" color="text.secondary">
                  Other type of payee
                </Typography>
              </Box>
            </MenuItem>
          </TextField>

          {/* Payee Name (only if payee is NOT customer) */}
          {formData.payee_type !== 'CUSTOMER' && (
            <TextField
              fullWidth
              label="Payee Name"
              name="payee_name"
              value={formData.payee_name}
              onChange={handleChange}
              disabled={isSubmitting}
              helperText="Name of the person or entity receiving the check"
            />
          )}

          {/* Customer Selection (only if payee is customer) */}
          {formData.payee_type === 'CUSTOMER' && (
            <Autocomplete
              fullWidth
              options={customers}
              loading={loadingCustomers}
              value={selectedCustomer}
              onChange={(event, newValue) => {
                setSelectedCustomer(newValue);
                setFormData(prev => ({
                  ...prev,
                  customer_id: newValue ? newValue.id : '',
                  payee_name: newValue ? newValue.name : prev.payee_name
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
          )}

          {/* Notes */}
          <TextField
            fullWidth
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={3}
            disabled={isSubmitting}
            helperText="Additional notes or remarks about this check"
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
              : (check ? 'Update Check' : 'Add Check')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

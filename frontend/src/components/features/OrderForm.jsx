// ============================================================================
// Order Form - Material UI Version
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
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import OrderItemsTable from './OrderItemsTable.jsx';

export default function OrderForm({
  order,
  customers = [],
  projects = [],
  onSubmit,
  onCancel,
  loading
}) {
  const [formData, setFormData] = useState({
    customer_id: '',
    project_id: '',
    delivery_date: '',
    delivery_address: '',
    notes: '',
    items: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState([]);

  // Initialize form with order data if editing
  useEffect(() => {
    if (order) {
      setFormData({
        customer_id: order.customer_id || '',
        project_id: order.project_id || '',
        delivery_date: order.delivery_date ? new Date(order.delivery_date).toISOString().split('T')[0] : '',
        delivery_address: order.delivery_address || '',
        notes: order.notes || '',
        items: order.items || []
      });
    } else {
      setFormData({
        customer_id: '',
        project_id: '',
        delivery_date: '',
        delivery_address: '',
        notes: '',
        items: []
      });
    }
    setErrors({});
  }, [order]);

  // Filter projects by selected customer
  useEffect(() => {
    if (formData.customer_id) {
      const customerProjects = projects.filter(
        p => p.customer_id === parseInt(formData.customer_id)
      );
      setFilteredProjects(customerProjects);

      if (formData.project_id) {
        const projectExists = customerProjects.some(
          p => p.id === parseInt(formData.project_id)
        );
        if (!projectExists) {
          setFormData(prev => ({ ...prev, project_id: '' }));
        }
      }
    } else {
      setFilteredProjects([]);
      setFormData(prev => ({ ...prev, project_id: '' }));
    }
  }, [formData.customer_id, projects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleItemsChange = (updatedItems) => {
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
    if (errors.items) {
      setErrors(prev => ({
        ...prev,
        items: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required';
    }

    if (!formData.items || formData.items.length === 0) {
      newErrors.items = 'Order must have at least one item';
    }

    if (formData.delivery_date) {
      const deliveryDate = new Date(formData.delivery_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (deliveryDate < today) {
        newErrors.delivery_date = 'Delivery date cannot be in the past';
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
      const orderData = {
        customer_id: parseInt(formData.customer_id),
        project_id: formData.project_id ? parseInt(formData.project_id) : null,
        delivery_date: formData.delivery_date || null,
        delivery_address: formData.delivery_address.trim() || '',
        notes: formData.notes.trim() || '',
        items: formData.items.map(item => ({
          item_id: item.item_id,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
          discount_percent: parseFloat(item.discount_percent) || 0,
          notes: item.notes || ''
        }))
      };

      await onSubmit(orderData);
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save order' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      customer_id: '',
      project_id: '',
      delivery_date: '',
      delivery_address: '',
      notes: '',
      items: []
    });
    setErrors({});
    onCancel();
  };

  // Calculate order totals from items
  const calculateTotals = () => {
    const totalAmount = formData.items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
    const discountAmount = formData.items.reduce((sum, item) => sum + (parseFloat(item.discount_amount) || 0), 0);
    const finalAmount = formData.items.reduce((sum, item) => sum + (parseFloat(item.final_amount) || 0), 0);

    return { totalAmount, discountAmount, finalAmount };
  };

  const totals = calculateTotals();

  return (
    <Paper elevation={0} sx={{ maxWidth: 600, width: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          {order ? (
            <EditIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          ) : (
            <AddIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          )}
          <Typography variant="h5" fontWeight={700}>
            {order ? 'Edit Order' : 'Create New Order'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {order
            ? `Editing order: ${order.order_id}`
            : 'Create a new order with items and details'}
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
          {/* Customer */}
          <TextField
            fullWidth
            required
            select
            label="Customer"
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            disabled={loading || isSubmitting}
            error={!!errors.customer_id}
            helperText={errors.customer_id || 'Select the customer for this order'}
          >
            <MenuItem value="">
              <em>Select Customer</em>
            </MenuItem>
            {customers.map(customer => (
              <MenuItem key={customer.id} value={customer.id}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {customer.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {customer.customer_id}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>

          {/* Project */}
          <TextField
            fullWidth
            select
            label="Project (Optional)"
            name="project_id"
            value={formData.project_id}
            onChange={handleChange}
            disabled={loading || isSubmitting || !formData.customer_id}
            helperText={
              !formData.customer_id
                ? 'Select a customer first to see their projects'
                : 'Link this order to a specific project (optional)'
            }
          >
            <MenuItem value="">
              <em>No Project</em>
            </MenuItem>
            {filteredProjects.map(project => (
              <MenuItem key={project.id} value={project.id}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {project.name || project.project_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {project.project_id}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>

          {/* Delivery Date */}
          <TextField
            fullWidth
            label="Delivery Date"
            name="delivery_date"
            type="date"
            value={formData.delivery_date}
            onChange={handleChange}
            disabled={loading || isSubmitting}
            InputLabelProps={{ shrink: true }}
            error={!!errors.delivery_date}
            helperText={errors.delivery_date || 'Expected delivery date (optional)'}
          />

          {/* Delivery Address */}
          <TextField
            fullWidth
            label="Delivery Address"
            name="delivery_address"
            value={formData.delivery_address}
            onChange={handleChange}
            disabled={loading || isSubmitting}
            helperText="Delivery location for this order"
          />

          {/* Notes */}
          <TextField
            fullWidth
            label="Order Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={3}
            disabled={loading || isSubmitting}
            helperText="Additional notes or instructions for this order"
          />

          {/* Order Items Section */}
          <Box>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Order Items <span style={{ color: 'error.main' }}>*</span>
            </Typography>
            <OrderItemsTable
              items={formData.items}
              onChange={handleItemsChange}
              readOnly={false}
            />
            {errors.items && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.items}
              </Typography>
            )}
          </Box>

          {/* Order Summary */}
          {formData.items.length > 0 && (
            <Paper sx={{ p: 2.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Order Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Amount:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ₨{totals.totalAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Discount:</Typography>
                  <Typography variant="body2" fontWeight={600} color="error.main">
                    -₨{totals.discountAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" fontWeight={700}>Final Amount:</Typography>
                  <Typography variant="body1" fontWeight={700} color="primary.main">
                    ₨{totals.finalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
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
              : (order ? 'Update Order' : 'Create Order')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

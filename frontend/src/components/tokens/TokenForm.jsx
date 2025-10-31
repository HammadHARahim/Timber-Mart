// ============================================================================
// Token Form - Material UI Version
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
import tokenService from '../../services/tokenService';
import orderService from '../../services/orderService';
import customerService from '../../services/customerService';
import projectService from '../../services/projectService';

export default function TokenForm({ token, orderId = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    order_id: orderId || '',
    customer_id: '',
    project_id: '',
    customer_name: '',
    project_name: '',
    vehicle_number: '',
    driver_name: '',
    driver_phone: '',
    notes: ''
  });

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (token) {
      setFormData({
        order_id: token.order_id || '',
        customer_id: token.customer_id || '',
        project_id: token.project_id || '',
        customer_name: token.customer_name || '',
        project_name: token.project_name || '',
        vehicle_number: token.vehicle_number || '',
        driver_name: token.driver_name || '',
        driver_phone: token.driver_phone || '',
        notes: token.notes || ''
      });
    }
  }, [token]);

  useEffect(() => {
    if (!orderId) {
      fetchOrders();
    }
  }, [orderId]);

  useEffect(() => {
    fetchCustomers();
    fetchProjects();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await orderService.getAllOrders({ limit: 100, status: 'CONFIRMED' });
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await customerService.getAllCustomers({ limit: 100, is_active: true });
      setCustomers(response.data.customers || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await projectService.getAllProjects({ limit: 100, is_active: true });
      setProjects(response.data.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-fill customer name when customer is selected
    if (name === 'customer_id' && value && customers) {
      const customer = customers.find(c => c.id === parseInt(value));
      if (customer) {
        setFormData(prev => ({
          ...prev,
          customer_name: customer.name
        }));
      }
    }

    // Auto-fill project name when project is selected
    if (name === 'project_id' && value && projects) {
      const project = projects.find(p => p.id === parseInt(value));
      if (project) {
        setFormData(prev => ({
          ...prev,
          project_name: project.name
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Either Order or Customer Name is required
    if (!formData.customer_name && !formData.order_id) {
      newErrors.customer_name = 'Either Order or Customer Name is required';
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
      if (formData.order_id) {
        // Generate from order
        await tokenService.generateFromOrder(formData.order_id, {
          vehicle_number: formData.vehicle_number,
          driver_name: formData.driver_name,
          driver_phone: formData.driver_phone,
          notes: formData.notes
        });
      } else {
        // Create standalone token
        if (token) {
          await tokenService.updateToken(token.id, formData);
        } else {
          await tokenService.createToken(formData);
        }
      }

      if (onSave) {
        onSave();
      }
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to save token' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ maxWidth: 600, width: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          {token ? (
            <EditIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          ) : (
            <AddIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          )}
          <Typography variant="h5" fontWeight={700}>
            {token ? 'Edit Token' : 'Create New Token'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {token
            ? 'Update token information and delivery details'
            : 'Create a new delivery token with QR code'}
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

          {/* Link to Order (Optional) */}
          {!orderId && !token && (
            <TextField
              fullWidth
              select
              label="Link to Order (Optional)"
              name="order_id"
              value={formData.order_id}
              onChange={handleChange}
              disabled={loadingOrders}
              helperText="Select an existing order to link (optional)"
            >
              <MenuItem value="">
                <Box>
                  <Typography variant="body2" fontWeight={600}>No Order (Standalone Token)</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Create a token without linking to an order
                  </Typography>
                </Box>
              </MenuItem>
              {orders && orders.map(order => (
                <MenuItem key={order.id} value={order.id}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {order.order_number} - {order.customer_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ₨{order.total_amount}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* Customer Selection & Name (only if no order selected) */}
          {!formData.order_id && (
            <>
              <TextField
                fullWidth
                select
                label="Customer"
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
                disabled={loadingCustomers}
                helperText="Select a customer to auto-fill name"
              >
                <MenuItem value="">
                  <em>Select Customer</em>
                </MenuItem>
                {customers && customers.map(customer => (
                  <MenuItem key={customer.id} value={customer.id}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{customer.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {customer.phone}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                required={!formData.order_id}
                label="Customer Name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!errors.customer_name}
                helperText={errors.customer_name || "Full name of the customer"}
              />

              <TextField
                fullWidth
                select
                label="Project"
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                disabled={loadingProjects}
                helperText="Select a project to auto-fill name (optional)"
              >
                <MenuItem value="">
                  <em>Select Project</em>
                </MenuItem>
                {projects && projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{project.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {project.location}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Project Name"
                name="project_name"
                value={formData.project_name}
                onChange={handleChange}
                disabled={isSubmitting}
                helperText="Name of the project (optional)"
              />
            </>
          )}

          {/* Vehicle Number */}
          <TextField
            fullWidth
            label="Vehicle Number"
            name="vehicle_number"
            value={formData.vehicle_number}
            onChange={(e) => handleChange({ target: { name: 'vehicle_number', value: e.target.value.toUpperCase() } })}
            disabled={isSubmitting}
            helperText="Vehicle registration number (e.g., ABC-1234)"
          />

          {/* Driver Name */}
          <TextField
            fullWidth
            label="Driver Name"
            name="driver_name"
            value={formData.driver_name}
            onChange={handleChange}
            disabled={isSubmitting}
            helperText="Full name of the driver"
          />

          {/* Driver Phone */}
          <TextField
            fullWidth
            label="Driver Phone"
            name="driver_phone"
            type="tel"
            value={formData.driver_phone}
            onChange={handleChange}
            disabled={isSubmitting}
            helperText="Driver's contact phone number"
          />

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
            helperText="Additional notes or special delivery instructions"
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
              : (token ? 'Update Token' : 'Create Token')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

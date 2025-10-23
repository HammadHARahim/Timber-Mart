// ============================================================================
// FILE: src/components/tokens/TokenForm.jsx
// Token creation/editing form
// ============================================================================

import React, { useState, useEffect } from 'react';
import tokenService from '../../services/tokenService';
import orderService from '../../services/orderService';
import customerService from '../../services/customerService';
import projectService from '../../services/projectService';
import './TokenForm.css';

const TokenForm = ({ token, orderId = null, onSave, onCancel }) => {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      // Projects endpoint doesn't exist yet (Phase 8), set empty array
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-fill customer name when customer is selected
    if (field === 'customer_id' && value && customers) {
      const customer = customers.find(c => c.id === parseInt(value));
      if (customer) {
        setFormData(prev => ({
          ...prev,
          customer_name: customer.name
        }));
      }
    }

    // Auto-fill project name when project is selected
    if (field === 'project_id' && value && projects) {
      const project = projects.find(p => p.id === parseInt(value));
      if (project) {
        setFormData(prev => ({
          ...prev,
          project_name: project.name
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.customer_name && !formData.order_id) {
      setError('Either Order or Customer Name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

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
      setError(err.response?.data?.message || 'Failed to save token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="token-form-container">
      <form onSubmit={handleSubmit} className="token-form">
        <h2>{token ? 'Edit Token' : 'Create Token'}</h2>

        {error && <div className="error-message">{error}</div>}

        {/* Source Selection */}
        <div className="form-section">
          <h3>Token Source</h3>

          {!orderId && !token && (
            <div className="form-group">
              <label htmlFor="order_id">Link to Order (Optional)</label>
              <select
                id="order_id"
                value={formData.order_id}
                onChange={(e) => handleChange('order_id', e.target.value)}
                disabled={loadingOrders}
              >
                <option value="">No Order (Standalone Token)</option>
                {orders && orders.map(order => (
                  <option key={order.id} value={order.id}>
                    {order.order_number} - {order.customer_name} ({order.total_amount})
                  </option>
                ))}
              </select>
            </div>
          )}

          {!formData.order_id && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customer_id">Customer</label>
                  <select
                    id="customer_id"
                    value={formData.customer_id}
                    onChange={(e) => handleChange('customer_id', e.target.value)}
                    disabled={loadingCustomers}
                  >
                    <option value="">Select Customer</option>
                    {customers && customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="customer_name">Customer Name *</label>
                  <input
                    id="customer_name"
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => handleChange('customer_name', e.target.value)}
                    placeholder="Enter customer name"
                    required={!formData.order_id}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="project_id">Project</label>
                  <select
                    id="project_id"
                    value={formData.project_id}
                    onChange={(e) => handleChange('project_id', e.target.value)}
                    disabled={loadingProjects}
                  >
                    <option value="">Select Project</option>
                    {projects && projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} - {project.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="project_name">Project Name</label>
                  <input
                    id="project_name"
                    type="text"
                    value={formData.project_name}
                    onChange={(e) => handleChange('project_name', e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Vehicle & Driver Info */}
        <div className="form-section">
          <h3>Vehicle & Driver Information</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicle_number">Vehicle Number</label>
              <input
                id="vehicle_number"
                type="text"
                value={formData.vehicle_number}
                onChange={(e) => handleChange('vehicle_number', e.target.value.toUpperCase())}
                placeholder="e.g., ABC-1234"
              />
            </div>

            <div className="form-group">
              <label htmlFor="driver_name">Driver Name</label>
              <input
                id="driver_name"
                type="text"
                value={formData.driver_name}
                onChange={(e) => handleChange('driver_name', e.target.value)}
                placeholder="Driver's name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="driver_phone">Driver Phone</label>
              <input
                id="driver_phone"
                type="tel"
                value={formData.driver_phone}
                onChange={(e) => handleChange('driver_phone', e.target.value)}
                placeholder="Driver's phone number"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes or instructions"
              rows="3"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : token ? 'Update Token' : 'Create Token'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TokenForm;

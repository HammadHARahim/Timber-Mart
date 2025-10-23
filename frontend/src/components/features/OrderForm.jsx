// ============================================================================
// FILE: src/components/features/OrderForm.jsx
// Complete Order Create/Edit Form Component
// ============================================================================

import { useState, useEffect } from 'react';
import OrderItemsTable from './OrderItemsTable.jsx';
import '../../styles/OrderForm.css';

/**
 * OrderForm Component
 *
 * Props:
 *   - order: Order object (if editing) or null (if creating)
 *   - customers: Array of customer options
 *   - projects: Array of project options (filtered by customer)
 *   - onSubmit: Function called with form data when submitted
 *   - onCancel: Function called when user cancels
 *   - loading: Boolean indicating if request is in progress
 */
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
      // Reset form for new order
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

      // Reset project_id if it doesn't belong to selected customer
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

  /**
   * Handle input changes
   */
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

  /**
   * Handle order items change
   */
  const handleItemsChange = (updatedItems) => {
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
    // Clear items error if any
    if (errors.items) {
      setErrors(prev => ({
        ...prev,
        items: ''
      }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};

    // Customer is required
    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required';
    }

    // At least one item is required
    if (!formData.items || formData.items.length === 0) {
      newErrors.items = 'Order must have at least one item';
    }

    // Validate delivery date if provided
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

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Prepare order data
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

    // Call parent submit handler
    onSubmit(orderData);

    // Reset submitting state after submission
    setIsSubmitting(false);
  };

  /**
   * Handle cancel
   */
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
    <div className="order-form-wrapper">
      <div className="order-form">
        <div className="form-header">
          <h2>{order ? 'Edit Order' : 'Create New Order'}</h2>
          <p className="form-subtitle">
            {order
              ? `Editing order: ${order.order_id}`
              : 'Create a new order with items'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Customer and Project Selection */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="customer_id">
                Customer <span className="required">*</span>
              </label>
              <select
                id="customer_id"
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
                className={errors.customer_id ? 'input-error' : ''}
                disabled={loading || isSubmitting}
                required
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.customer_id})
                  </option>
                ))}
              </select>
              {errors.customer_id && <span className="error-message">{errors.customer_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="project_id">Project (Optional)</label>
              <select
                id="project_id"
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                disabled={loading || isSubmitting || !formData.customer_id}
              >
                <option value="">No Project</option>
                {filteredProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.project_id})
                  </option>
                ))}
              </select>
              {!formData.customer_id && (
                <p className="help-text">Select a customer first to see their projects</p>
              )}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="delivery_date">Delivery Date</label>
              <input
                id="delivery_date"
                type="date"
                name="delivery_date"
                value={formData.delivery_date}
                onChange={handleChange}
                className={errors.delivery_date ? 'input-error' : ''}
                disabled={loading || isSubmitting}
              />
              {errors.delivery_date && <span className="error-message">{errors.delivery_date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="delivery_address">Delivery Address</label>
              <input
                id="delivery_address"
                type="text"
                name="delivery_address"
                value={formData.delivery_address}
                onChange={handleChange}
                placeholder="Enter delivery address"
                disabled={loading || isSubmitting}
              />
            </div>
          </div>

          {/* Notes Field */}
          <div className="form-group">
            <label htmlFor="notes">Order Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes or instructions for this order"
              rows="3"
              disabled={loading || isSubmitting}
            />
          </div>

          {/* Order Items Table */}
          <div className="form-section">
            <h3>Order Items <span className="required">*</span></h3>
            <OrderItemsTable
              items={formData.items}
              onChange={handleItemsChange}
              readOnly={false}
            />
            {errors.items && <span className="error-message">{errors.items}</span>}
          </div>

          {/* Order Summary */}
          {formData.items.length > 0 && (
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Total Amount:</span>
                <span className="amount">₨{totals.totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Total Discount:</span>
                <span className="amount discount">-₨{totals.discountAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Final Amount:</span>
                <span className="amount">₨{totals.finalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || isSubmitting}
            >
              {isSubmitting || loading ? (
                <>
                  <span className="spinner"></span>
                  {order ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                order ? 'Update Order' : 'Create Order'
              )}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
              disabled={loading || isSubmitting}
            >
              Cancel
            </button>
          </div>

          {/* Form Info */}
          <div className="form-info">
            <p>
              <strong>Note:</strong> Fields marked with <span className="required">*</span> are required
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

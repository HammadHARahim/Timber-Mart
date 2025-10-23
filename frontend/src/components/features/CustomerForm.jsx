// ============================================================================
// FILE: src/components/features/CustomerForm.jsx
// Complete Customer Create/Edit Form Component
// ============================================================================

import { useState, useEffect } from 'react';
import styles from '../../styles/CustomerForm.module.css';

/**
 * CustomerForm Component
 * 
 * Props:
 *   - customer: Customer object (if editing) or null (if creating)
 *   - onSubmit: Function called with form data when submitted
 *   - onCancel: Function called when user cancels
 *   - loading: Boolean indicating if request is in progress
 */
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
      // Reset form for new customer
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
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};

    // Name is required
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Customer name is required';
    }

    // Name should be at least 2 characters
    if (formData.name && formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Phone format validation (basic)
    if (formData.phone && formData.phone.trim().length < 5) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Email format validation
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
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
    
    // Call parent submit handler
    onSubmit({
      name: formData.name.trim(),
      phone: formData.phone.trim() || '',
      email: formData.email.trim() || '',
      address: formData.address.trim() || '',
      customer_type: formData.customer_type
    });

    // Reset submitting state after submission
    setIsSubmitting(false);
  };

  /**
   * Handle cancel
   */
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
    <div className={styles.customerFormWrapper}>
      <div className={styles.customerForm}>
        <div className={styles.formHeader}>
          <h2>{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
          <p className={styles.formSubtitle}>
            {customer 
              ? `Editing customer: ${customer.name}` 
              : 'Create a new customer record'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name Field */}
          <div className={styles.formGroup}>
            <label htmlFor="name">
              Customer Name <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter customer name"
              className={errors.name ? 'input-error' : ''}
              disabled={loading || isSubmitting}
              required
            />
            {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
          </div>

          {/* Two Column Row: Phone and Email */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g., 555-1234 or +92 300 1234567"
                className={errors.phone ? 'input-error' : ''}
                disabled={loading || isSubmitting}
              />
              {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g., customer@example.com"
                className={errors.email ? 'input-error' : ''}
                disabled={loading || isSubmitting}
              />
              {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
            </div>
          </div>

          {/* Address Field */}
          <div className={styles.formGroup}>
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter customer address (street, city, etc.)"
              rows="3"
              disabled={loading || isSubmitting}
            />
          </div>

          {/* Customer Type Field */}
          <div className={styles.formGroup}>
            <label htmlFor="customer_type">Customer Type</label>
            <select
              id="customer_type"
              name="customer_type"
              value={formData.customer_type}
              onChange={handleChange}
              disabled={loading || isSubmitting}
            >
              <option value="regular">Regular</option>
              <option value="new">New</option>
              <option value="premium">Premium</option>
            </select>
            <p className={styles.helpText}>
              Select the customer category to organize them appropriately
            </p>
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={loading || isSubmitting}
            >
              {isSubmitting || loading ? (
                <>
                  <span className={styles.spinner}></span>
                  {customer ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                customer ? 'Update Customer' : 'Create Customer'
              )}
            </button>

            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleCancel}
              disabled={loading || isSubmitting}
            >
              Cancel
            </button>
          </div>

          {/* Form Info */}
          <div className={styles.formInfo}>
            <p>
              <strong>Note:</strong> Fields marked with <span className={styles.required}>*</span> are required
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
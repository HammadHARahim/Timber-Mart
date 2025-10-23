// ============================================================================
// FILE: src/pages/PaymentsPage.jsx
// Payments management page
// ============================================================================

import { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';
import PaymentList from '../components/payments/PaymentList';
import PaymentForm from '../components/payments/PaymentForm';
import styles from '../styles/PaymentsPage.module.css';

export default function PaymentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    payment_type: '',
    payment_method: '',
    status: '',
    page: 1,
    limit: 20
  });

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentService.getAllPayments(filters);
      setPayments(response.data.payments || []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      setError(err.message || 'Failed to load payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1
    }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Handle create new payment
  const handleCreate = () => {
    setEditingPayment(null);
    setShowForm(true);
  };

  // Handle edit payment
  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setShowForm(true);
  };

  // Handle form submit
  const handleFormSubmit = async (formData) => {
    try {
      if (editingPayment) {
        await paymentService.updatePayment(editingPayment.id, formData);
      } else {
        await paymentService.createPayment(formData);
      }
      setShowForm(false);
      setEditingPayment(null);
      fetchPayments();
    } catch (err) {
      alert(err.message || 'Failed to save payment');
    }
  };

  // Handle cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingPayment(null);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) {
      return;
    }

    try {
      await paymentService.deletePayment(id);
      fetchPayments();
    } catch (err) {
      alert(err.message || 'Failed to delete payment');
    }
  };

  // Handle approve
  const handleApprove = async (id) => {
    try {
      await paymentService.approvePayment(id);
      fetchPayments();
    } catch (err) {
      alert(err.message || 'Failed to approve payment');
    }
  };

  // Handle reject
  const handleReject = async (id) => {
    try {
      await paymentService.rejectPayment(id);
      fetchPayments();
    } catch (err) {
      alert(err.message || 'Failed to reject payment');
    }
  };

  return (
    <div className={styles.paymentsPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1>Payments</h1>
        <button onClick={handleCreate} className={styles.btnAddPayment}>
          + Create Payment
        </button>
      </div>

      {/* Error Message */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Payment Form */}
      {showForm && (
        <PaymentForm
          payment={editingPayment}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by payment ID, reference..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className={styles.searchInput}
        />

        <select
          value={filters.payment_type}
          onChange={(e) => handleFilterChange('payment_type', e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All Types</option>
          <option value="LOAN">Loan</option>
          <option value="ADVANCE">Advance</option>
          <option value="DEPOSIT">Deposit</option>
          <option value="ORDER_PAYMENT">Order Payment</option>
          <option value="REFUND">Refund</option>
        </select>

        <select
          value={filters.payment_method}
          onChange={(e) => handleFilterChange('payment_method', e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All Methods</option>
          <option value="CASH">Cash</option>
          <option value="CHECK">Check</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="CARD">Card</option>
          <option value="ONLINE">Online</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Payment List */}
      {loading && <div className={styles.loading}>Loading payments...</div>}

      {!loading && payments.length === 0 && (
        <div className={styles.emptyState}>
          <h3>No payments found</h3>
          <p>Create your first payment to get started</p>
        </div>
      )}

      {!loading && payments.length > 0 && (
        <PaymentList
          payments={payments}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FILE: src/pages/ChecksPage.jsx
// Checks tracking page
// ============================================================================

import { useState, useEffect } from 'react';
import checkService from '../services/checkService';
import CheckList from '../components/checks/CheckList';
import CheckForm from '../components/checks/CheckForm';
import styles from '../styles/ChecksPage.module.css';

export default function ChecksPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingCheck, setEditingCheck] = useState(null);
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [statistics, setStatistics] = useState({});

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    payee_type: '',
    page: 1,
    limit: 20
  });

  // Fetch checks
  const fetchChecks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await checkService.getAllChecks(filters);
      setChecks(response.data.checks || []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      setError(err.message || 'Failed to load checks');
      setChecks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await checkService.getStatistics();
      setStatistics(response.data || {});
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  useEffect(() => {
    fetchChecks();
    fetchStatistics();
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

  // Handle create new check
  const handleCreate = () => {
    setEditingCheck(null);
    setShowForm(true);
  };

  // Handle edit check
  const handleEdit = (check) => {
    setEditingCheck(check);
    setShowForm(true);
  };

  // Handle form submit
  const handleFormSubmit = async (formData) => {
    try {
      if (editingCheck) {
        await checkService.updateCheck(editingCheck.id, formData);
      } else {
        await checkService.createCheck(formData);
      }
      setShowForm(false);
      setEditingCheck(null);
      fetchChecks();
      fetchStatistics();
    } catch (err) {
      alert(err.message || 'Failed to save check');
    }
  };

  // Handle cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingCheck(null);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this check?')) {
      return;
    }

    try {
      await checkService.deleteCheck(id);
      fetchChecks();
      fetchStatistics();
    } catch (err) {
      alert(err.message || 'Failed to delete check');
    }
  };

  // Handle clear check
  const handleClear = async (id) => {
    try {
      await checkService.clearCheck(id);
      fetchChecks();
      fetchStatistics();
    } catch (err) {
      alert(err.message || 'Failed to clear check');
    }
  };

  // Handle bounce check
  const handleBounce = async (id) => {
    try {
      await checkService.bounceCheck(id);
      fetchChecks();
      fetchStatistics();
    } catch (err) {
      alert(err.message || 'Failed to mark check as bounced');
    }
  };

  // Handle cancel check
  const handleCancelCheck = async (id) => {
    try {
      await checkService.cancelCheck(id);
      fetchChecks();
      fetchStatistics();
    } catch (err) {
      alert(err.message || 'Failed to cancel check');
    }
  };

  return (
    <div className={styles.checksPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1>Checks Tracking</h1>
          {statistics.total > 0 && (
            <div className={styles.statsBar}>
              <span className={styles.statItem}>
                <span className={styles.statLabel}>Pending:</span>
                <span className={styles.statValue}>{statistics.pending || 0}</span>
              </span>
              <span className={styles.statItem}>
                <span className={styles.statLabel}>Overdue:</span>
                <span className={`${styles.statValue} ${styles.warning}`}>{statistics.overdue || 0}</span>
              </span>
              <span className={styles.statItem}>
                <span className={styles.statLabel}>Cleared:</span>
                <span className={`${styles.statValue} ${styles.success}`}>{statistics.cleared || 0}</span>
              </span>
            </div>
          )}
        </div>
        <button onClick={handleCreate} className={styles.btnAddCheck}>
          + Add Check
        </button>
      </div>

      {/* Error Message */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Check Form */}
      {showForm && (
        <CheckForm
          check={editingCheck}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by check number, payee..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className={styles.searchInput}
        />

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CLEARED">Cleared</option>
          <option value="BOUNCED">Bounced</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          value={filters.payee_type}
          onChange={(e) => handleFilterChange('payee_type', e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All Payee Types</option>
          <option value="CUSTOMER">Customer</option>
          <option value="SUPPLIER">Supplier</option>
          <option value="EMPLOYEE">Employee</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Check List */}
      {loading && <div className={styles.loading}>Loading checks...</div>}

      {!loading && checks.length === 0 && (
        <div className={styles.emptyState}>
          <h3>No checks found</h3>
          <p>Add your first check to start tracking</p>
        </div>
      )}

      {!loading && checks.length > 0 && (
        <CheckList
          checks={checks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClear={handleClear}
          onBounce={handleBounce}
          onCancel={handleCancelCheck}
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

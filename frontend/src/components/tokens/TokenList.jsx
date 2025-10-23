// ============================================================================
// FILE: src/components/tokens/TokenList.jsx
// Token list component with filtering and actions
// ============================================================================

import React, { useState, useEffect } from 'react';
import tokenService from '../../services/tokenService';
import './TokenList.css';

const TokenList = ({ onEdit, onView, onPrint, orderId = null }) => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    order_id: orderId || '',
    status: '',
    search: '',
    date_from: '',
    date_to: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchTokens();
  }, [filters]);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tokenService.getAllTokens(filters);
      setTokens(response.data.tokens);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1
    }));
  };

  const handleCancel = async (token) => {
    if (!confirm(`Cancel token ${token.token_id}?`)) return;

    try {
      await tokenService.cancelToken(token.id);
      fetchTokens();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel token');
    }
  };

  const handleMarkAsUsed = async (token) => {
    if (!confirm(`Mark token ${token.token_id} as used?`)) return;

    try {
      await tokenService.markAsUsed(token.id);
      fetchTokens();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark token as used');
    }
  };

  const handleRegenerateQR = async (token) => {
    if (!confirm(`Regenerate QR code for token ${token.token_id}?`)) return;

    try {
      await tokenService.regenerateQRCode(token.id);
      fetchTokens();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to regenerate QR code');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      ACTIVE: 'status-active',
      USED: 'status-used',
      CANCELLED: 'status-cancelled'
    };
    return statusClasses[status] || 'status-active';
  };

  if (loading && tokens.length === 0) {
    return <div className="token-list-loading">Loading tokens...</div>;
  }

  return (
    <div className="token-list-container">
      {/* Filters */}
      {!orderId && (
        <div className="token-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search tokens..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="USED">Used</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <input
              type="date"
              placeholder="From Date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <input
              type="date"
              placeholder="To Date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="filter-input"
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Token Table */}
      <div className="token-table-container">
        <table className="token-table">
          <thead>
            <tr>
              <th>Token ID</th>
              <th>Customer</th>
              <th>Order</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>QR Code</th>
              <th>Status</th>
              <th>Prints</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map(token => (
              <tr key={token.id}>
                <td className="token-id">{token.token_id}</td>
                <td>{token.customer_name || '-'}</td>
                <td>{token.order_number || '-'}</td>
                <td>{token.vehicle_number || '-'}</td>
                <td>{token.driver_name || '-'}</td>
                <td>
                  {token.qr_code_url && (
                    <img
                      src={token.qr_code_url}
                      alt="QR Code"
                      className="qr-code-thumbnail"
                      onClick={() => onView && onView(token)}
                      title="Click to view details"
                    />
                  )}
                </td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(token.status)}`}>
                    {token.status}
                  </span>
                </td>
                <td className="text-center">{token.print_count}</td>
                <td>{new Date(token.created_at).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    {onView && (
                      <button
                        onClick={() => onView(token)}
                        className="btn-icon"
                        title="View Details"
                      >
                        👁️
                      </button>
                    )}
                    {onPrint && token.status === 'ACTIVE' && (
                      <button
                        onClick={() => onPrint(token)}
                        className="btn-icon"
                        title="Print Token"
                      >
                        🖨️
                      </button>
                    )}
                    {onEdit && token.status === 'ACTIVE' && (
                      <button
                        onClick={() => onEdit(token)}
                        className="btn-icon"
                        title="Edit"
                      >
                        ✏️
                      </button>
                    )}
                    {token.status === 'ACTIVE' && (
                      <>
                        <button
                          onClick={() => handleMarkAsUsed(token)}
                          className="btn-icon"
                          title="Mark as Used"
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => handleCancel(token)}
                          className="btn-icon btn-danger"
                          title="Cancel Token"
                        >
                          ❌
                        </button>
                        <button
                          onClick={() => handleRegenerateQR(token)}
                          className="btn-icon"
                          title="Regenerate QR Code"
                        >
                          🔄
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Results */}
      {tokens.length === 0 && !loading && (
        <div className="no-results">
          <p>No tokens found</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handleFilterChange('page', filters.page - 1)}
            disabled={filters.page === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.currentPage} of {pagination.totalPages}
            ({pagination.totalRecords} tokens)
          </span>
          <button
            onClick={() => handleFilterChange('page', filters.page + 1)}
            disabled={filters.page >= pagination.totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TokenList;

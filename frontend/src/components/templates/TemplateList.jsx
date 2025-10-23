// ============================================================================
// FILE: src/components/templates/TemplateList.jsx
// Print template list component with filtering
// ============================================================================

import React, { useState, useEffect } from 'react';
import printTemplateService from '../../services/printTemplateService';
import './TemplateList.css';

const TemplateList = ({ refreshTrigger, onEdit, onDuplicate, onDelete, onSelectTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    search: '',
    is_active: true,
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchTemplates();
  }, [filters, refreshTrigger]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await printTemplateService.getAllTemplates(filters);
      // getAllTemplates returns { templates, pagination } directly
      setTemplates(response?.templates || []);
      setPagination(response?.pagination || {});
    } catch (err) {
      setError(err.message || 'Failed to load templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await printTemplateService.setAsDefault(id);
      fetchTemplates(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to set default template');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page on filter change
    }));
  };

  const getTypeBadgeClass = (type) => {
    const typeClasses = {
      TOKEN: 'badge-token',
      INVOICE: 'badge-invoice',
      RECEIPT: 'badge-receipt',
      VOUCHER: 'badge-voucher',
      CUSTOM: 'badge-custom'
    };
    return typeClasses[type] || 'badge-custom';
  };

  if (loading && templates.length === 0) {
    return <div className="template-list-loading">Loading templates...</div>;
  }

  return (
    <div className="template-list-container">
      {/* Filters */}
      <div className="template-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search templates..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="TOKEN">Token</option>
            <option value="INVOICE">Invoice</option>
            <option value="RECEIPT">Receipt</option>
            <option value="VOUCHER">Voucher</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.is_active}
            onChange={(e) => handleFilterChange('is_active', e.target.value === 'true')}
            className="filter-select"
          >
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
            <option value="">All Status</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Empty State */}
      {!loading && templates.length === 0 && (
        <div className="empty-state">
          <p>No templates found</p>
          {filters.search || filters.type ? (
            <p>Try adjusting your filters</p>
          ) : (
            <p>Create your first template to get started</p>
          )}
        </div>
      )}

      {/* Template Grid */}
      <div className="template-grid">
        {templates && templates.map(template => (
          <div key={template.id} className={`template-card ${!template.is_active ? 'inactive' : ''}`}>
            <div className="template-card-header">
              <div className="template-info">
                <h3 className="template-name">{template.name}</h3>
                <span className={`template-badge ${getTypeBadgeClass(template.type)}`}>
                  {template.type}
                </span>
                {template.is_default && (
                  <span className="default-badge">Default</span>
                )}
              </div>
              <div className="template-actions">
                {onEdit && (
                  <button
                    onClick={() => onEdit(template)}
                    className="btn-icon"
                    title="Edit"
                  >
                    ✏️
                  </button>
                )}
                {onDuplicate && (
                  <button
                    onClick={() => onDuplicate(template)}
                    className="btn-icon"
                    title="Duplicate"
                  >
                    📋
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(template)}
                    className="btn-icon btn-danger"
                    title="Delete"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>

            <div className="template-card-body">
              {template.description && (
                <p className="template-description">{template.description}</p>
              )}

              <div className="template-details">
                <div className="detail-item">
                  <span className="detail-label">Page Size:</span>
                  <span className="detail-value">{template.page_size}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Orientation:</span>
                  <span className="detail-value">{template.orientation}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Version:</span>
                  <span className="detail-value">v{template.version}</span>
                </div>
              </div>

              {template.created_by_name && (
                <div className="template-meta">
                  Created by {template.created_by_name}
                </div>
              )}
            </div>

            <div className="template-card-footer">
              {!template.is_default && template.is_active && (
                <button
                  onClick={() => handleSetDefault(template.id)}
                  className="btn btn-secondary btn-sm"
                >
                  Set as Default
                </button>
              )}
              {onSelectTemplate && (
                <button
                  onClick={() => onSelectTemplate(template)}
                  className="btn btn-primary btn-sm"
                >
                  Use Template
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {templates.length === 0 && !loading && (
        <div className="no-results">
          <p>No templates found</p>
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
            ({pagination.totalRecords} templates)
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

export default TemplateList;

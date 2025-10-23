// ============================================================================
// FILE: src/components/features/OrderDetail.jsx
// Order detail view component with complete information
// ============================================================================

import { useState } from 'react';
import StatusBadge from '../shared/StatusBadge.jsx';
import OrderItemsTable from './OrderItemsTable.jsx';
import '../../styles/OrderDetail.css';

export default function OrderDetail({
  order,
  onEdit,
  onStatusChange,
  onClose,
  canEdit
}) {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'PENDING');

  if (!order) {
    return <div className="empty-state">Order not found</div>;
  }

  const handleStatusUpdate = () => {
    if (selectedStatus !== order.status) {
      onStatusChange(order.id, selectedStatus);
    }
    setShowStatusModal(false);
  };

  return (
    <div className="order-detail-wrapper">
      <div className="order-detail">
        {/* Header */}
        <div className="detail-header">
          <div className="header-left">
            <h2>Order Details</h2>
            <p className="order-id">{order.order_id}</p>
          </div>
          <div className="header-right">
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
            {canEdit && (
              <button className="btn-primary" onClick={() => onEdit(order)}>
                Edit Order
              </button>
            )}
          </div>
        </div>

        {/* Status and Payment Information */}
        <div className="detail-section">
          <h3>Status Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Order Status:</label>
              <div className="status-display">
                <StatusBadge status={order.status} type="order" />
                {canEdit && (
                  <button
                    className="btn-link"
                    onClick={() => setShowStatusModal(true)}
                  >
                    Change Status
                  </button>
                )}
              </div>
            </div>
            <div className="info-item">
              <label>Payment Status:</label>
              <StatusBadge status={order.payment_status} type="payment" />
            </div>
            <div className="info-item">
              <label>Order Date:</label>
              <span>{new Date(order.order_date).toLocaleDateString()}</span>
            </div>
            {order.delivery_date && (
              <div className="info-item">
                <label>Delivery Date:</label>
                <span>{new Date(order.delivery_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Customer and Project Information */}
        <div className="detail-section">
          <h3>Customer & Project</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Customer:</label>
              <div>
                <div className="customer-name">{order.customer?.name || 'N/A'}</div>
                <div className="customer-details">
                  {order.customer?.phone && <span>Phone: {order.customer.phone}</span>}
                  {order.customer?.email && <span>Email: {order.customer.email}</span>}
                </div>
              </div>
            </div>
            {order.project && (
              <div className="info-item">
                <label>Project:</label>
                <div>
                  <div className="project-name">{order.project.name}</div>
                  <div className="project-id">{order.project.project_id}</div>
                </div>
              </div>
            )}
            {order.delivery_address && (
              <div className="info-item full-width">
                <label>Delivery Address:</label>
                <span>{order.delivery_address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="detail-section">
          <h3>Order Items</h3>
          <OrderItemsTable items={order.items || []} readOnly={true} />
        </div>

        {/* Financial Summary */}
        <div className="detail-section financial-summary">
          <h3>Financial Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <label>Total Amount:</label>
              <span className="amount">₨{parseFloat(order.total_amount || 0).toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <label>Total Discount:</label>
              <span className="amount discount">-₨{parseFloat(order.discount_amount || 0).toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <label>Final Amount:</label>
              <span className="amount final">₨{parseFloat(order.final_amount || 0).toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <label>Paid Amount:</label>
              <span className="amount paid">₨{parseFloat(order.paid_amount || 0).toFixed(2)}</span>
            </div>
            <div className="summary-item highlight">
              <label>Balance Due:</label>
              <span className="amount balance">₨{parseFloat(order.balance_amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="detail-section">
            <h3>Notes</h3>
            <div className="notes-content">{order.notes}</div>
          </div>
        )}

        {/* Metadata */}
        <div className="detail-section metadata">
          <h3>Additional Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Created By:</label>
              <span>{order.creator?.full_name || order.creator?.username || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Created At:</label>
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>
            {order.updated_at && (
              <div className="info-item">
                <label>Last Updated:</label>
                <span>{new Date(order.updated_at).toLocaleString()}</span>
              </div>
            )}
            <div className="info-item">
              <label>Sync Status:</label>
              <span className={`sync-status sync-${order.sync_status?.toLowerCase()}`}>
                {order.sync_status || 'SYNCED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Order Status</h3>
              <button className="modal-close" onClick={() => setShowStatusModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Current Status: <StatusBadge status={order.status} type="order" /></p>
              <div className="form-group">
                <label>New Status:</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleStatusUpdate}>
                Update Status
              </button>
              <button className="btn-secondary" onClick={() => setShowStatusModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

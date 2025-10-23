// ============================================================================
// FILE: src/components/features/OrderList.jsx
// Order list table component with filtering
// ============================================================================

import { useState } from 'react';
import '../../styles/OrderList.css';

export default function OrderList({
  orders,
  loading,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  canEdit,
  canDelete
}) {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    payment_status: '',
    date_from: '',
    date_to: ''
  });

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'warning',
      'CONFIRMED': 'info',
      'IN_PROGRESS': 'primary',
      'COMPLETED': 'success',
      'CANCELLED': 'danger'
    };
    return colors[status] || 'secondary';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'UNPAID': 'danger',
      'PARTIAL': 'warning',
      'PAID': 'success'
    };
    return colors[status] || 'secondary';
  };

  if (orders.length === 0) {
    return <div className="empty-state">No orders found</div>;
  }

  return (
    <div className="order-list">
      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by Order ID or notes..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
          className="search-input"
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          value={filters.payment_status}
          onChange={(e) => setFilters({...filters, payment_status: e.target.value})}
          className="filter-select"
        >
          <option value="">All Payment Status</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PARTIAL">Partial</option>
          <option value="PAID">Paid</option>
        </select>

        <input
          type="date"
          value={filters.date_from}
          onChange={(e) => setFilters({...filters, date_from: e.target.value})}
          className="date-input"
          placeholder="From Date"
        />

        <input
          type="date"
          value={filters.date_to}
          onChange={(e) => setFilters({...filters, date_to: e.target.value})}
          className="date-input"
          placeholder="To Date"
        />
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Project</th>
            <th>Order Date</th>
            <th>Items</th>
            <th>Total Amount</th>
            <th>Paid</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="order-id" onClick={() => onView(order)}>
                {order.order_id}
              </td>
              <td>{order.customer?.name || 'N/A'}</td>
              <td>{order.project?.name || '-'}</td>
              <td>{new Date(order.order_date).toLocaleDateString()}</td>
              <td className="text-center">{order.items?.length || 0}</td>
              <td className="amount">₨{parseFloat(order.final_amount || 0).toFixed(2)}</td>
              <td className="amount">₨{parseFloat(order.paid_amount || 0).toFixed(2)}</td>
              <td className="amount balance">₨{parseFloat(order.balance_amount || 0).toFixed(2)}</td>
              <td>
                <span className={`badge badge-${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td>
                <span className={`badge badge-${getPaymentStatusColor(order.payment_status)}`}>
                  {order.payment_status}
                </span>
              </td>
              <td className="actions">
                <button
                  className="btn-small btn-view"
                  onClick={() => onView(order)}
                >
                  View
                </button>
                {canEdit && (
                  <button
                    className="btn-small btn-edit"
                    onClick={() => onEdit(order)}
                  >
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    className="btn-small btn-delete"
                    onClick={() => onDelete(order.id)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

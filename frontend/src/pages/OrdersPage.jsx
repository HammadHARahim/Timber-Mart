// ============================================================================
// FILE: src/pages/OrdersPage.jsx
// Main orders management page
// ============================================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import OrderList from '../components/features/OrderList';
import OrderForm from '../components/features/OrderForm';
import OrderDetail from '../components/features/OrderDetail';
import orderService from '../services/orderService';
import apiService from '../services/apiService';
import '../styles/OrdersPage.css';

export default function OrdersPage() {
  const [view, setView] = useState('list'); // 'list', 'form', 'detail'
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, hasPermission } = useAuth();

  // Fetch orders
  const fetchOrders = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getAllOrders(filters);
      setOrders(response.data?.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers for form
  const fetchCustomers = async () => {
    try {
      const response = await apiService.getCustomers({ limit: 1000 });
      // API returns data directly as an array, not nested in 'customers'
      setCustomers(response.data || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  // Fetch projects for form
  const fetchProjects = async () => {
    try {
      // Note: Add getProjects method to apiService
      // For now, using empty array - implement based on your projects endpoint
      setProjects([]);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProjects();
  }, []);

  // Handle create new order
  const handleCreate = () => {
    setSelectedOrder(null);
    setView('form');
  };

  // Handle edit order
  const handleEdit = (order) => {
    setSelectedOrder(order);
    setView('form');
  };

  // Handle view order details
  const handleView = async (order) => {
    setLoading(true);
    try {
      // Fetch full order details with items
      const response = await orderService.getOrderById(order.id);
      setSelectedOrder(response.data);
      setView('detail');
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit (create/update)
  const handleFormSubmit = async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      if (selectedOrder) {
        await orderService.updateOrder(selectedOrder.id, orderData);
      } else {
        await orderService.createOrder(orderData);
      }
      await fetchOrders();
      setView('list');
      setSelectedOrder(null);
    } catch (err) {
      console.error('Failed to save order:', err);
      setError(err.response?.data?.message || 'Failed to save order');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete order
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await orderService.deleteOrder(id);
      await fetchOrders();
    } catch (err) {
      console.error('Failed to delete order:', err);
      setError(err.response?.data?.message || 'Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      await orderService.updateOrderStatus(id, status);
      await fetchOrders();
      if (view === 'detail' && selectedOrder?.id === id) {
        const response = await orderService.getOrderById(id);
        setSelectedOrder(response.data);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setView('list');
    setSelectedOrder(null);
    setError(null);
  };

  // Check permissions
  if (!hasPermission('order:view')) {
    return (
      <div className="error-page">
        <h2>Access Denied</h2>
        <p>You don't have permission to view orders</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>Order Management</h1>
          <p className="page-subtitle">
            {view === 'list' && 'Manage customer orders and track status'}
            {view === 'form' && (selectedOrder ? 'Edit Order' : 'Create New Order')}
            {view === 'detail' && 'Order Details'}
          </p>
        </div>
        <div className="header-actions">
          {view === 'list' && hasPermission('order:create') && (
            <button className="btn-primary" onClick={handleCreate}>
              + Create Order
            </button>
          )}
          {view !== 'list' && (
            <button className="btn-secondary" onClick={handleCancel}>
              ← Back to List
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <OrderList
          orders={orders}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          canEdit={hasPermission('order:edit')}
          canDelete={hasPermission('order:delete')}
        />
      )}

      {/* Form View */}
      {view === 'form' && (
        <OrderForm
          order={selectedOrder}
          customers={customers}
          projects={projects}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      )}

      {/* Detail View */}
      {view === 'detail' && selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onEdit={handleEdit}
          onStatusChange={handleStatusChange}
          onClose={handleCancel}
          canEdit={hasPermission('order:edit')}
        />
      )}
    </div>
  );
}

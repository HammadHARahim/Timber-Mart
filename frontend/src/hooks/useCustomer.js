// ============================================================================
// PHASE 4: CUSTOMER MANAGEMENT - FRONTEND
// ============================================================================
// All files use ES module imports (import/export)
// ============================================================================

// ============================================================================
// FILE: src/hooks/useCustomer.js
// Custom hook for customer CRUD operations
// ============================================================================

import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api, ApiError } from '../utils/apiClient';

export function useCustomer() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const { user } = useAuth();
  const { addNotification } = useNotification();

  // Fetch customers with filters
  const fetchCustomers = useCallback(async (page = 1, search = '', customerType = '', sortBy = 'created_at', sortOrder = 'DESC') => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...(search && { search }),
        ...(customerType && { customer_type: customerType }),
        sortBy,
        sortOrder
      });

      const data = await api.get(`/api/customers?${queryParams}`);
      setCustomers(data.data);
      setPagination(data.pagination);
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message,
        persistent: error instanceof ApiError && error.status !== 0
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, addNotification]);

  // Fetch single customer
  const fetchCustomer = useCallback(async (id) => {
    try {
      setLoading(true);
      const data = await api.get(`/api/customers/${id}`);
      return data.data;
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message,
        persistent: error instanceof ApiError && error.status !== 0
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Create customer
  const createCustomer = useCallback(async (customerData) => {
    try {
      setLoading(true);
      const data = await api.post('/api/customers', customerData);
      addNotification({
        type: 'success',
        message: 'Customer created successfully'
      });
      return data.data;
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message,
        persistent: error instanceof ApiError && error.status !== 0
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Update customer
  const updateCustomer = useCallback(async (id, customerData) => {
    try {
      setLoading(true);
      const data = await api.put(`/api/customers/${id}`, customerData);
      addNotification({
        type: 'success',
        message: 'Customer updated successfully'
      });
      return data.data;
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message,
        persistent: error instanceof ApiError && error.status !== 0
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Delete customer
  const deleteCustomer = useCallback(async (id) => {
    try {
      setLoading(true);
      await api.delete(`/api/customers/${id}`);
      addNotification({
        type: 'success',
        message: 'Customer deleted successfully'
      });
      return true;
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message,
        persistent: error instanceof ApiError && error.status !== 0
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Search customers
  const searchCustomers = useCallback(async (query) => {
    try {
      const data = await api.get(`/api/customers/search/${query}`);
      return data.data;
    } catch (error) {
      return [];
    }
  }, []);

  return {
    customers,
    loading,
    pagination,
    fetchCustomers,
    fetchCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers
  };
}

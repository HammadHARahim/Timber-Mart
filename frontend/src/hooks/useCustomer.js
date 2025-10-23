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

const API_URL = import.meta.env.VITE_API_URL;

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
      const token = sessionStorage.getItem('auth_token');

      const queryParams = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...(search && { search }),
        ...(customerType && { customer_type: customerType }),
        sortBy,
        sortOrder
      });

      const response = await fetch(`${API_URL}/api/customers?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data.data);
      setPagination(data.pagination);
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message,
        persistent: true
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, addNotification]);

  // Fetch single customer
  const fetchCustomer = useCallback(async (id) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/api/customers/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message,
        persistent: true
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
      const token = sessionStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create customer');
      }

      const data = await response.json();
      addNotification({
        type: 'success',
        message: 'Customer created successfully'
      });
      return data.data;
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message,
        persistent: true
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
      const token = sessionStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update customer');
      }

      const data = await response.json();
      addNotification({
        type: 'success',
        message: 'Customer updated successfully'
      });
      return data.data;
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message,
        persistent: true
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
      const token = sessionStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/api/customers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete customer');
      }

      addNotification({
        type: 'success',
        message: 'Customer deleted successfully'
      });
      return true;
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message,
        persistent: true
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Search customers
  const searchCustomers = useCallback(async (query) => {
    try {
      const token = sessionStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/api/customers/search/${query}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
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

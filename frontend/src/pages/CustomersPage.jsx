// ============================================================================
// FILE: src/pages/CustomersPage.jsx
// Main customers list page
// ============================================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCustomer } from '../hooks/useCustomer';
import CustomerList from '../components/features/CustomerList';
import CustomerForm from '../components/features/CustomerForm';
import styles from '../styles/CustomersPage.module.css';

export default function CustomersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { user, hasPermission } = useAuth();
  const {
    customers,
    loading,
    pagination,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  } = useCustomer();

  // Initial fetch
  useEffect(() => {
    fetchCustomers(1, searchTerm, customerType);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1);
    fetchCustomers(1, term, customerType);
  };

  // Handle filter
  const handleFilterChange = (e) => {
    const type = e.target.value;
    setCustomerType(type);
    setCurrentPage(1);
    fetchCustomers(1, searchTerm, type);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchCustomers(newPage, searchTerm, customerType);
  };

  // Handle create/edit form submit
  const handleFormSubmit = async (formData) => {
    let result;

    if (editingCustomer) {
      result = await updateCustomer(editingCustomer.id, formData);
    } else {
      result = await createCustomer(formData);
    }

    if (result) {
      setShowForm(false);
      setEditingCustomer(null);
      fetchCustomers(currentPage, searchTerm, customerType);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      const success = await deleteCustomer(id);
      if (success) {
        fetchCustomers(currentPage, searchTerm, customerType);
      }
    }
  };

  // Check permission
  if (!hasPermission('customer.view')) {
    return <div className={styles.error}>You don't have permission to view customers</div>;
  }

  return (
    <div className={styles.customersPage}>
      <div className={styles.pageHeader}>
        <h1>Customers</h1>
        {hasPermission('customer.create') && (
          <button
            className={styles.btnAddCustomer}
            onClick={() => {
              setEditingCustomer(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'Cancel' : '+ Add Customer'}
          </button>
        )}
      </div>

      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
          loading={loading}
        />
      )}

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={searchTerm}
          onChange={handleSearch}
          className={styles.searchInput}
        />

        <select
          value={customerType}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <option value="">All Types</option>
          <option value="regular">Regular</option>
          <option value="new">New</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      <CustomerList
        customers={customers}
        loading={loading}
        onEdit={(customer) => {
          setEditingCustomer(customer);
          setShowForm(true);
        }}
        onDelete={handleDelete}
        canEdit={hasPermission('customer.edit')}
        canDelete={hasPermission('customer.delete')}
      />

      <div className={styles.pagination}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        >
          Previous
        </button>

        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= pagination.totalPages || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
}
// ============================================================================
// FILE: src/components/features/CustomerList.jsx
// Customer list table component
// ============================================================================

import styles from '../../styles/CustomerList.module.css';

export default function CustomerList({
  customers,
  loading,
  onEdit,
  onDelete,
  canEdit,
  canDelete
}) {
  if (loading) {
    return <div className={styles.loading}>Loading customers...</div>;
  }

  if (customers.length === 0) {
    return <div className={styles.emptyState}>No customers found</div>;
  }

  return (
    <div className={styles.customerList}>
      <table className={styles.customersTable}>
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Balance</th>
            <th>Type</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.customer_id}</td>
              <td className={styles.customerName}>{customer.name}</td>
              <td>{customer.phone}</td>
              <td>{customer.email}</td>
              <td className={styles.balance}>₨{parseFloat(customer.balance).toFixed(2)}</td>
              <td>
                <span className={`${styles.badge} ${styles['badge' + customer.customer_type.charAt(0).toUpperCase() + customer.customer_type.slice(1)]}`}>
                  {customer.customer_type}
                </span>
              </td>
              <td>{new Date(customer.created_at).toLocaleDateString()}</td>
              <td className={styles.actions}>
                {canEdit && (
                  <button
                    className={`${styles.btnSmall} ${styles.btnEdit}`}
                    onClick={() => onEdit(customer)}
                  >
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    className={`${styles.btnSmall} ${styles.btnDelete}`}
                    onClick={() => onDelete(customer.id)}
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
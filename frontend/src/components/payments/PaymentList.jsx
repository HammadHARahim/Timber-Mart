// ============================================================================
// FILE: src/components/payments/PaymentList.jsx
// Payment list table component
// ============================================================================

import styles from './PaymentList.module.css';

export default function PaymentList({
  payments,
  onEdit,
  onDelete,
  onApprove,
  onReject
}) {
  const formatCurrency = (amount) => {
    return `₨${parseFloat(amount).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusClass = (status) => {
    const statusMap = {
      PENDING: 'statusPending',
      APPROVED: 'statusApproved',
      REJECTED: 'statusRejected',
      COMPLETED: 'statusCompleted',
      CANCELLED: 'statusCancelled'
    };
    return styles[statusMap[status]] || '';
  };

  return (
    <div className={styles.paymentList}>
      <table className={styles.paymentsTable}>
        <thead>
          <tr>
            <th>Payment ID</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Method</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className={styles.paymentId}>{payment.payment_id}</td>
              <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
              <td>{payment.customer?.name || 'N/A'}</td>
              <td className={styles.amount}>{formatCurrency(payment.amount)}</td>
              <td>
                <span className={styles.badge}>{payment.payment_type}</span>
              </td>
              <td>{payment.payment_method}</td>
              <td>
                <span className={`${styles.statusBadge} ${getStatusClass(payment.status)}`}>
                  {payment.status}
                </span>
              </td>
              <td className={styles.actions}>
                {payment.status === 'PENDING' && (
                  <>
                    <button
                      className={`${styles.btnSmall} ${styles.btnSuccess}`}
                      onClick={() => onApprove(payment.id)}
                      title="Approve"
                    >
                      ✓
                    </button>
                    <button
                      className={`${styles.btnSmall} ${styles.btnDanger}`}
                      onClick={() => onReject(payment.id)}
                      title="Reject"
                    >
                      ✗
                    </button>
                  </>
                )}
                <button
                  className={`${styles.btnSmall} ${styles.btnEdit}`}
                  onClick={() => onEdit(payment)}
                >
                  Edit
                </button>
                {(payment.status === 'PENDING' || payment.status === 'REJECTED') && (
                  <button
                    className={`${styles.btnSmall} ${styles.btnDelete}`}
                    onClick={() => onDelete(payment.id)}
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

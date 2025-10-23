// ============================================================================
// FILE: src/components/checks/CheckList.jsx
// Check list table component
// ============================================================================

import styles from './CheckList.module.css';

export default function CheckList({
  checks,
  onEdit,
  onDelete,
  onClear,
  onBounce,
  onCancel
}) {
  const formatCurrency = (amount) => {
    return `₨${parseFloat(amount).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusClass = (status) => {
    const statusMap = {
      PENDING: 'statusPending',
      CLEARED: 'statusCleared',
      BOUNCED: 'statusBounced',
      CANCELLED: 'statusCancelled'
    };
    return styles[statusMap[status]] || '';
  };

  return (
    <div className={styles.checkList}>
      <table className={styles.checksTable}>
        <thead>
          <tr>
            <th>Check #</th>
            <th>Date</th>
            <th>Payee</th>
            <th>Bank</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((check) => (
            <tr key={check.id}>
              <td className={styles.checkNumber}>{check.check_number}</td>
              <td>{new Date(check.check_date).toLocaleDateString()}</td>
              <td>{check.payee_name || 'N/A'}</td>
              <td>{check.bank_name || 'N/A'}</td>
              <td className={styles.amount}>{formatCurrency(check.amount)}</td>
              <td>
                <span className={`${styles.statusBadge} ${getStatusClass(check.status)}`}>
                  {check.status}
                </span>
              </td>
              <td className={styles.actions}>
                {check.status === 'PENDING' && (
                  <>
                    <button
                      className={`${styles.btnSmall} ${styles.btnSuccess}`}
                      onClick={() => onClear(check.id)}
                      title="Clear"
                    >
                      Clear
                    </button>
                    <button
                      className={`${styles.btnSmall} ${styles.btnWarning}`}
                      onClick={() => onBounce(check.id)}
                      title="Bounce"
                    >
                      Bounce
                    </button>
                  </>
                )}
                <button
                  className={`${styles.btnSmall} ${styles.btnEdit}`}
                  onClick={() => onEdit(check)}
                >
                  Edit
                </button>
                {check.status !== 'CLEARED' && (
                  <button
                    className={`${styles.btnSmall} ${styles.btnDelete}`}
                    onClick={() => onDelete(check.id)}
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

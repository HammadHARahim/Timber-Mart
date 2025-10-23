// ============================================================================
// FILE: src/components/shared/StatusBadge.jsx
// Reusable status badge component
// ============================================================================

import '../../styles/StatusBadge.css';

export default function StatusBadge({ status, type = 'order' }) {
  const getStatusInfo = () => {
    if (type === 'order') {
      const orderStatuses = {
        'PENDING': { label: 'Pending', color: 'warning' },
        'CONFIRMED': { label: 'Confirmed', color: 'info' },
        'IN_PROGRESS': { label: 'In Progress', color: 'primary' },
        'COMPLETED': { label: 'Completed', color: 'success' },
        'CANCELLED': { label: 'Cancelled', color: 'danger' }
      };
      return orderStatuses[status] || { label: status, color: 'secondary' };
    }

    if (type === 'payment') {
      const paymentStatuses = {
        'UNPAID': { label: 'Unpaid', color: 'danger' },
        'PARTIAL': { label: 'Partial', color: 'warning' },
        'PAID': { label: 'Paid', color: 'success' }
      };
      return paymentStatuses[status] || { label: status, color: 'secondary' };
    }

    return { label: status, color: 'secondary' };
  };

  const { label, color } = getStatusInfo();

  return (
    <span className={`status-badge status-badge-${color}`}>
      {label}
    </span>
  );
}

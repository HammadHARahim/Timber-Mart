// ============================================================================
// FILE: src/components/payments/PaymentForm.jsx
// Payment form component (stub - expand as needed)
// ============================================================================

import { useState } from 'react';
import styles from './PaymentForm.module.css';

export default function PaymentForm({ payment, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    customer_id: payment?.customer_id || '',
    amount: payment?.amount || '',
    payment_type: payment?.payment_type || 'ADVANCE',
    payment_method: payment?.payment_method || 'CASH',
    description: payment?.description || '',
    status: payment?.status || 'PENDING'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.paymentForm}>
      <h3>{payment ? 'Edit Payment' : 'Create Payment'}</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Customer ID</label>
          <input
            type="number"
            value={formData.customer_id}
            onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Amount</label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Payment Type</label>
          <select
            value={formData.payment_type}
            onChange={(e) => setFormData({...formData, payment_type: e.target.value})}
          >
            <option value="LOAN">Loan</option>
            <option value="ADVANCE">Advance</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="ORDER_PAYMENT">Order Payment</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Payment Method</label>
          <select
            value={formData.payment_method}
            onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
          >
            <option value="CASH">Cash</option>
            <option value="CHECK">Check</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CARD">Card</option>
            <option value="ONLINE">Online</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
          />
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnSubmit}>
            {payment ? 'Update' : 'Create'} Payment
          </button>
          <button type="button" onClick={onCancel} className={styles.btnCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// FILE: src/components/checks/CheckForm.jsx
// Check form component (stub - expand as needed)
// ============================================================================

import { useState } from 'react';
import styles from './CheckForm.module.css';

export default function CheckForm({ check, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    customer_id: check?.customer_id || '',
    check_number: check?.check_number || '',
    amount: check?.amount || '',
    check_date: check?.check_date || '',
    bank_name: check?.bank_name || '',
    payee_name: check?.payee_name || '',
    payee_type: check?.payee_type || 'CUSTOMER',
    notes: check?.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.checkForm}>
      <h3>{check ? 'Edit Check' : 'Add Check'}</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Check Number *</label>
            <input
              type="text"
              value={formData.check_number}
              onChange={(e) => setFormData({...formData, check_number: e.target.value})}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Check Date *</label>
            <input
              type="date"
              value={formData.check_date}
              onChange={(e) => setFormData({...formData, check_date: e.target.value})}
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Amount *</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Bank Name</label>
            <input
              type="text"
              value={formData.bank_name}
              onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Payee Name</label>
            <input
              type="text"
              value={formData.payee_name}
              onChange={(e) => setFormData({...formData, payee_name: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Payee Type</label>
            <select
              value={formData.payee_type}
              onChange={(e) => setFormData({...formData, payee_type: e.target.value})}
            >
              <option value="CUSTOMER">Customer</option>
              <option value="SUPPLIER">Supplier</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={3}
          />
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnSubmit}>
            {check ? 'Update' : 'Add'} Check
          </button>
          <button type="button" onClick={onCancel} className={styles.btnCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

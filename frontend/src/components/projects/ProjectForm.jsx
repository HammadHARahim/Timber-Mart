// ============================================================================
// FILE: src/components/projects/ProjectForm.jsx
// Project form component
// ============================================================================

import { useState } from 'react';
import styles from './ProjectForm.module.css';

export default function ProjectForm({ project, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    project_name: project?.project_name || '',
    description: project?.description || '',
    customer_id: project?.customer_id || '',
    estimated_amount: project?.estimated_amount || '',
    actual_amount: project?.actual_amount || '',
    status: project?.status || 'PLANNED'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.projectForm}>
      <h3>{project ? 'Edit Project' : 'Create Project'}</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Project Name *</label>
          <input
            type="text"
            value={formData.project_name}
            onChange={(e) => setFormData({...formData, project_name: e.target.value})}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Customer ID *</label>
          <input
            type="number"
            value={formData.customer_id}
            onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Estimated Amount</label>
          <input
            type="number"
            step="0.01"
            value={formData.estimated_amount}
            onChange={(e) => setFormData({...formData, estimated_amount: e.target.value})}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Actual Amount</label>
          <input
            type="number"
            step="0.01"
            value={formData.actual_amount}
            onChange={(e) => setFormData({...formData, actual_amount: e.target.value})}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
          >
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="CANCELLED">Cancelled</option>
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
            {project ? 'Update' : 'Create'} Project
          </button>
          <button type="button" onClick={onCancel} className={styles.btnCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

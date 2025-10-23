// ============================================================================
// FILE: src/components/projects/ProjectList.jsx
// Project list table component
// ============================================================================

import styles from './ProjectList.module.css';

export default function ProjectList({ projects, onEdit, onDelete }) {
  const formatCurrency = (amount) => {
    return `₨${parseFloat(amount).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusClass = (status) => {
    const statusMap = {
      PLANNED: 'statusPlanned',
      IN_PROGRESS: 'statusInProgress',
      COMPLETED: 'statusCompleted',
      ON_HOLD: 'statusOnHold',
      CANCELLED: 'statusCancelled'
    };
    return styles[statusMap[status]] || '';
  };

  return (
    <div className={styles.projectList}>
      <table className={styles.projectsTable}>
        <thead>
          <tr>
            <th>Project ID</th>
            <th>Name</th>
            <th>Customer</th>
            <th>Estimated</th>
            <th>Actual</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td className={styles.projectId}>{project.project_id}</td>
              <td className={styles.projectName}>{project.project_name}</td>
              <td>{project.customer?.name || 'N/A'}</td>
              <td>{formatCurrency(project.estimated_amount || 0)}</td>
              <td>{formatCurrency(project.actual_amount || 0)}</td>
              <td className={styles.balance}>{formatCurrency(project.balance || 0)}</td>
              <td>
                <span className={`${styles.statusBadge} ${getStatusClass(project.status)}`}>
                  {project.status}
                </span>
              </td>
              <td className={styles.actions}>
                <button
                  className={`${styles.btnSmall} ${styles.btnEdit}`}
                  onClick={() => onEdit(project)}
                >
                  Edit
                </button>
                <button
                  className={`${styles.btnSmall} ${styles.btnDelete}`}
                  onClick={() => onDelete(project.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

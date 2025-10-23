// ============================================================================
// FILE: src/pages/ProjectsPage.jsx
// Projects management page
// ============================================================================

import { useState, useEffect } from 'react';
import projectService from '../services/projectService';
import ProjectList from '../components/projects/ProjectList';
import ProjectForm from '../components/projects/ProjectForm';
import styles from '../styles/ProjectsPage.module.css';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 20
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getAllProjects(filters);
      if (response.success) {
        setProjects(response.data.projects || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectService.deleteProject(id);
      fetchProjects();
    } catch (err) {
      alert(err.message || 'Failed to delete project');
    }
  };

  const handleSubmit = async (projectData) => {
    try {
      if (editingProject) {
        await projectService.updateProject(editingProject.id, projectData);
      } else {
        await projectService.createProject(projectData);
      }
      setShowForm(false);
      setEditingProject(null);
      fetchProjects();
    } catch (err) {
      alert(err.message || 'Failed to save project');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className={styles.projectsPage}>
      <div className={styles.pageHeader}>
        <h1>Projects</h1>
        <button className={styles.btnAddProject} onClick={handleCreate}>
          + Add Project
        </button>
      </div>

      {showForm && (
        <ProjectForm
          project={editingProject}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search projects..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All Status</option>
          <option value="PLANNED">Planned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading && <div className={styles.loading}>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}

      {!loading && !error && projects.length === 0 && (
        <div className={styles.emptyState}>
          <p>No projects found</p>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <>
          <ProjectList
            projects={projects}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                disabled={filters.page === 1}
                onClick={() => handlePageChange(filters.page - 1)}
              >
                Previous
              </button>
              <span>Page {filters.page} of {totalPages}</span>
              <button
                disabled={filters.page >= totalPages}
                onClick={() => handlePageChange(filters.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

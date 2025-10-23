// ============================================================================
// FILE: src/services/projectService.js
// Project management API service
// ============================================================================

import apiService from './apiService';

const RESOURCE = '/api/projects';

const projectService = {
  // Get all projects with optional filters
  async getAllProjects(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const query = queryParams.toString();
    return apiService.get(`${RESOURCE}${query ? `?${query}` : ''}`);
  },

  // Get project by ID
  async getProjectById(id) {
    return apiService.get(`${RESOURCE}/${id}`);
  },

  // Get project statistics
  async getProjectStatistics(id) {
    return apiService.get(`${RESOURCE}/${id}/statistics`);
  },

  // Get dashboard stats
  async getDashboardStats() {
    return apiService.get(`${RESOURCE}/dashboard-stats`);
  },

  // Get revenue report
  async getRevenueReport(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.start_date) queryParams.append('start_date', filters.start_date);
    if (filters.end_date) queryParams.append('end_date', filters.end_date);
    
    const query = queryParams.toString();
    return apiService.get(`${RESOURCE}/revenue-report${query ? `?${query}` : ''}`);
  },

  // Create new project
  async createProject(projectData) {
    return apiService.post(RESOURCE, projectData);
  },

  // Update project
  async updateProject(id, projectData) {
    return apiService.put(`${RESOURCE}/${id}`, projectData);
  },

  // Delete project
  async deleteProject(id) {
    return apiService.delete(`${RESOURCE}/${id}`);
  }
};

export default projectService;

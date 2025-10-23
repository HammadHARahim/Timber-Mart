// ============================================================================
// FILE: src/services/checkService.js
// Check tracking API service
// ============================================================================

import apiService from './apiService';

const RESOURCE = '/api/checks';

/**
 * Check Service
 * Handles all API calls for check tracking management
 */
const checkService = {
  /**
   * Get all checks with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Checks list with pagination
   */
  async getAllChecks(filters = {}) {
    const params = new URLSearchParams();

    if (filters.customer_id) params.append('customer_id', filters.customer_id);
    if (filters.project_id) params.append('project_id', filters.project_id);
    if (filters.payment_id) params.append('payment_id', filters.payment_id);
    if (filters.status) params.append('status', filters.status);
    if (filters.payee_type) params.append('payee_type', filters.payee_type);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await apiService.get(`${RESOURCE}?${params.toString()}`);
    return response;
  },

  /**
   * Get all pending checks
   * @returns {Promise<Array>} List of pending checks
   */
  async getPendingChecks() {
    const response = await apiService.get(`${RESOURCE}/pending`);
    return response;
  },

  /**
   * Get overdue checks
   * @returns {Promise<Array>} List of overdue checks
   */
  async getOverdueChecks() {
    const response = await apiService.get(`${RESOURCE}/overdue`);
    return response;
  },

  /**
   * Get check statistics
   * @returns {Promise<Object>} Check statistics
   */
  async getStatistics() {
    const response = await apiService.get(`${RESOURCE}/statistics`);
    return response;
  },

  /**
   * Get a single check by ID
   * @param {number} id - Check ID
   * @returns {Promise<Object>} Check data
   */
  async getCheckById(id) {
    const response = await apiService.get(`${RESOURCE}/${id}`);
    return response;
  },

  /**
   * Create a new check
   * @param {Object} checkData - Check data
   * @returns {Promise<Object>} Created check
   */
  async createCheck(checkData) {
    const response = await apiService.post(RESOURCE, checkData);
    return response;
  },

  /**
   * Update a check
   * @param {number} id - Check ID
   * @param {Object} checkData - Updated check data
   * @returns {Promise<Object>} Updated check
   */
  async updateCheck(id, checkData) {
    const response = await apiService.put(`${RESOURCE}/${id}`, checkData);
    return response;
  },

  /**
   * Delete a check
   * @param {number} id - Check ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteCheck(id) {
    const response = await apiService.delete(`${RESOURCE}/${id}`);
    return response;
  },

  /**
   * Mark check as cleared
   * @param {number} id - Check ID
   * @returns {Promise<Object>} Cleared check
   */
  async clearCheck(id) {
    const response = await apiService.post(`${RESOURCE}/${id}/clear`);
    return response;
  },

  /**
   * Mark check as bounced
   * @param {number} id - Check ID
   * @returns {Promise<Object>} Bounced check
   */
  async bounceCheck(id) {
    const response = await apiService.post(`${RESOURCE}/${id}/bounce`);
    return response;
  },

  /**
   * Cancel a check
   * @param {number} id - Check ID
   * @returns {Promise<Object>} Cancelled check
   */
  async cancelCheck(id) {
    const response = await apiService.post(`${RESOURCE}/${id}/cancel`);
    return response;
  },

  /**
   * Get checks by customer
   * @param {number} customerId - Customer ID
   * @returns {Promise<Array>} List of checks
   */
  async getChecksByCustomer(customerId) {
    const response = await apiService.get(`${RESOURCE}/customer/${customerId}`);
    return response;
  },

  /**
   * Get checks by project
   * @param {number} projectId - Project ID
   * @returns {Promise<Array>} List of checks
   */
  async getChecksByProject(projectId) {
    const response = await apiService.get(`${RESOURCE}/project/${projectId}`);
    return response;
  },

  /**
   * Get checks by payment
   * @param {number} paymentId - Payment ID
   * @returns {Promise<Array>} List of checks
   */
  async getChecksByPayment(paymentId) {
    const response = await apiService.get(`${RESOURCE}/payment/${paymentId}`);
    return response;
  }
};

export default checkService;

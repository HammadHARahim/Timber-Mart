// ============================================================================
// FILE: src/services/printTemplateService.js
// Print template management API service
// ============================================================================

import apiService from './apiService';

const RESOURCE = '/api/print-templates';

/**
 * Print Template Service
 * Handles all API calls for print template management
 */
const printTemplateService = {
  /**
   * Get all print templates with optional filters
   * @param {Object} filters - Filter options (type, search, is_active, page, limit)
   * @returns {Promise<Object>} Templates list with pagination
   */
  async getAllTemplates(filters = {}) {
    const params = new URLSearchParams();

    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await apiService.get(`${RESOURCE}?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single template by ID
   * @param {number} id - Template ID
   * @returns {Promise<Object>} Template data
   */
  async getTemplateById(id) {
    const response = await apiService.get(`${RESOURCE}/${id}`);
    return response.data;
  },

  /**
   * Get default template for a specific type
   * @param {string} type - Template type (TOKEN, INVOICE, RECEIPT, VOUCHER, CUSTOM)
   * @returns {Promise<Object>} Default template
   */
  async getDefaultTemplate(type) {
    const response = await apiService.get(`${RESOURCE}/default/${type}`);
    return response.data;
  },

  /**
   * Get available placeholders for a template type
   * @param {string} type - Template type
   * @returns {Promise<Array>} List of placeholders
   */
  async getPlaceholders(type) {
    const response = await apiService.get(`${RESOURCE}/${type}/placeholders`);
    return response.data;
  },

  /**
   * Create a new print template
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} Created template
   */
  async createTemplate(templateData) {
    const response = await apiService.post(RESOURCE, templateData);
    return response.data;
  },

  /**
   * Update an existing template
   * @param {number} id - Template ID
   * @param {Object} templateData - Updated template data
   * @returns {Promise<Object>} Updated template
   */
  async updateTemplate(id, templateData) {
    const response = await apiService.put(`${RESOURCE}/${id}`, templateData);
    return response.data;
  },

  /**
   * Delete a template
   * @param {number} id - Template ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteTemplate(id) {
    const response = await apiService.delete(`${RESOURCE}/${id}`);
    return response.data;
  },

  /**
   * Set template as default for its type
   * @param {number} id - Template ID
   * @returns {Promise<Object>} Updated template
   */
  async setAsDefault(id) {
    const response = await apiService.patch(`${RESOURCE}/${id}/set-default`);
    return response.data;
  },

  /**
   * Duplicate an existing template
   * @param {number} id - Template ID to duplicate
   * @returns {Promise<Object>} New duplicated template
   */
  async duplicateTemplate(id) {
    const response = await apiService.post(`${RESOURCE}/${id}/duplicate`);
    return response.data;
  }
};

export default printTemplateService;

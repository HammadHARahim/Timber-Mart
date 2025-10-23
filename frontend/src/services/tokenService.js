// ============================================================================
// FILE: src/services/tokenService.js
// Token management API service
// ============================================================================

import apiService from './apiService';

const RESOURCE = '/api/tokens';

/**
 * Token Service
 * Handles all API calls for delivery token management
 */
const tokenService = {
  /**
   * Get all tokens with optional filters
   * @param {Object} filters - Filter options (order_id, status, search, date_from, date_to, page, limit)
   * @returns {Promise<Object>} Tokens list with pagination
   */
  async getAllTokens(filters = {}) {
    const params = new URLSearchParams();

    if (filters.order_id) params.append('order_id', filters.order_id);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await apiService.get(`${RESOURCE}?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single token by ID
   * @param {number} id - Token ID
   * @returns {Promise<Object>} Token data
   */
  async getTokenById(id) {
    const response = await apiService.get(`${RESOURCE}/${id}`);
    return response.data;
  },

  /**
   * Get token by token_id string
   * @param {string} tokenId - Token ID string (e.g., TKN-xxxxx)
   * @returns {Promise<Object>} Token data
   */
  async getTokenByTokenId(tokenId) {
    const response = await apiService.get(`${RESOURCE}/by-token-id/${tokenId}`);
    return response.data;
  },

  /**
   * Get tokens for a specific order
   * @param {number} orderId - Order ID
   * @returns {Promise<Array>} List of tokens
   */
  async getTokensByOrder(orderId) {
    const response = await apiService.get(`${RESOURCE}/order/${orderId}`);
    return response.data;
  },

  /**
   * Create a new token
   * @param {Object} tokenData - Token data
   * @returns {Promise<Object>} Created token with QR code
   */
  async createToken(tokenData) {
    const response = await apiService.post(RESOURCE, tokenData);
    return response.data;
  },

  /**
   * Generate token from an existing order
   * @param {number} orderId - Order ID
   * @param {Object} additionalData - Additional data (vehicle_number, driver_name, driver_phone, notes)
   * @returns {Promise<Object>} Created token with QR code
   */
  async generateFromOrder(orderId, additionalData = {}) {
    const response = await apiService.post(`${RESOURCE}/from-order/${orderId}`, additionalData);
    return response.data;
  },

  /**
   * Update an existing token
   * @param {number} id - Token ID
   * @param {Object} tokenData - Updated token data
   * @returns {Promise<Object>} Updated token
   */
  async updateToken(id, tokenData) {
    const response = await apiService.put(`${RESOURCE}/${id}`, tokenData);
    return response.data;
  },

  /**
   * Cancel a token
   * @param {number} id - Token ID
   * @returns {Promise<Object>} Cancelled token
   */
  async cancelToken(id) {
    const response = await apiService.patch(`${RESOURCE}/${id}/cancel`);
    return response.data;
  },

  /**
   * Mark token as used
   * @param {number} id - Token ID
   * @returns {Promise<Object>} Updated token
   */
  async markAsUsed(id) {
    const response = await apiService.patch(`${RESOURCE}/${id}/use`);
    return response.data;
  },

  /**
   * Record a print event for a token
   * @param {number} id - Token ID
   * @returns {Promise<Object>} Updated token with incremented print count
   */
  async recordPrint(id) {
    const response = await apiService.patch(`${RESOURCE}/${id}/print`);
    return response.data;
  },

  /**
   * Regenerate QR code for a token
   * @param {number} id - Token ID
   * @returns {Promise<Object>} Token with new QR code
   */
  async regenerateQRCode(id) {
    const response = await apiService.post(`${RESOURCE}/${id}/regenerate-qr`);
    return response.data;
  }
};

export default tokenService;

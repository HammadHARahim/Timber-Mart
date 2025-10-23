// ============================================================================
// FILE: src/services/paymentService.js
// Payment management API service
// ============================================================================

import apiService from './apiService';

const RESOURCE = '/api/payments';

/**
 * Payment Service
 * Handles all API calls for payment management
 */
const paymentService = {
  /**
   * Get all payments with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Payments list with pagination
   */
  async getAllPayments(filters = {}) {
    const params = new URLSearchParams();

    if (filters.customer_id) params.append('customer_id', filters.customer_id);
    if (filters.project_id) params.append('project_id', filters.project_id);
    if (filters.order_id) params.append('order_id', filters.order_id);
    if (filters.payment_type) params.append('payment_type', filters.payment_type);
    if (filters.payment_method) params.append('payment_method', filters.payment_method);
    if (filters.status) params.append('status', filters.status);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await apiService.get(`${RESOURCE}?${params.toString()}`);
    return response;
  },

  /**
   * Get a single payment by ID
   * @param {number} id - Payment ID
   * @returns {Promise<Object>} Payment data
   */
  async getPaymentById(id) {
    const response = await apiService.get(`${RESOURCE}/${id}`);
    return response;
  },

  /**
   * Create a new payment
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Created payment
   */
  async createPayment(paymentData) {
    const response = await apiService.post(RESOURCE, paymentData);
    return response;
  },

  /**
   * Update a payment
   * @param {number} id - Payment ID
   * @param {Object} paymentData - Updated payment data
   * @returns {Promise<Object>} Updated payment
   */
  async updatePayment(id, paymentData) {
    const response = await apiService.put(`${RESOURCE}/${id}`, paymentData);
    return response;
  },

  /**
   * Delete a payment
   * @param {number} id - Payment ID
   * @returns {Promise<Object>} Deletion result
   */
  async deletePayment(id) {
    const response = await apiService.delete(`${RESOURCE}/${id}`);
    return response;
  },

  /**
   * Approve a payment
   * @param {number} id - Payment ID
   * @returns {Promise<Object>} Approved payment
   */
  async approvePayment(id) {
    const response = await apiService.post(`${RESOURCE}/${id}/approve`);
    return response;
  },

  /**
   * Reject a payment
   * @param {number} id - Payment ID
   * @returns {Promise<Object>} Rejected payment
   */
  async rejectPayment(id) {
    const response = await apiService.post(`${RESOURCE}/${id}/reject`);
    return response;
  },

  /**
   * Mark payment as completed
   * @param {number} id - Payment ID
   * @returns {Promise<Object>} Completed payment
   */
  async completePayment(id) {
    const response = await apiService.post(`${RESOURCE}/${id}/complete`);
    return response;
  },

  /**
   * Generate payment voucher
   * @param {number} id - Payment ID
   * @returns {Promise<Object>} Voucher data
   */
  async generateVoucher(id) {
    const response = await apiService.get(`${RESOURCE}/${id}/voucher`);
    return response;
  },

  /**
   * Get payments by customer
   * @param {number} customerId - Customer ID
   * @returns {Promise<Array>} List of payments
   */
  async getPaymentsByCustomer(customerId) {
    const response = await apiService.get(`${RESOURCE}/customer/${customerId}`);
    return response;
  },

  /**
   * Get payments by project
   * @param {number} projectId - Project ID
   * @returns {Promise<Array>} List of payments
   */
  async getPaymentsByProject(projectId) {
    const response = await apiService.get(`${RESOURCE}/project/${projectId}`);
    return response;
  },

  /**
   * Get payments by order
   * @param {number} orderId - Order ID
   * @returns {Promise<Array>} List of payments
   */
  async getPaymentsByOrder(orderId) {
    const response = await apiService.get(`${RESOURCE}/order/${orderId}`);
    return response;
  }
};

export default paymentService;

// ============================================================================
// FILE: src/services/customerService.js
// Customer management API service
// ============================================================================

import apiService from './apiService';

const customerService = {
  async getAllCustomers(filters = {}) {
    return apiService.getCustomers(filters);
  },

  async getCustomerById(id) {
    return apiService.getCustomer(id);
  },

  async createCustomer(customerData) {
    return apiService.createCustomer(customerData);
  },

  async updateCustomer(id, customerData) {
    return apiService.updateCustomer(id, customerData);
  },

  async deleteCustomer(id) {
    return apiService.deleteCustomer(id);
  }
};

export default customerService;

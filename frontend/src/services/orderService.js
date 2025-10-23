import apiService from './apiService.js';

class OrderService {
  // Get all orders with filtering
  async getAllOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiService.get(`/api/orders?${query}`);
  }

  // Get order by ID
  async getOrderById(id) {
    return apiService.get(`/api/orders/${id}`);
  }

  // Create new order
  async createOrder(orderData) {
    return apiService.post('/api/orders', orderData);
  }

  // Update order
  async updateOrder(id, orderData) {
    return apiService.put(`/api/orders/${id}`, orderData);
  }

  // Update order status
  async updateOrderStatus(id, status) {
    return apiService.request(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // Delete order
  async deleteOrder(id) {
    return apiService.delete(`/api/orders/${id}`);
  }

  // Get order statistics
  async getOrderStatistics(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiService.get(`/api/orders/statistics?${query}`);
  }
}

export default new OrderService();

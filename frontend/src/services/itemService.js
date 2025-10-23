import apiService from './apiService.js';

class ItemService {
  // Get all items with filtering
  async getAllItems(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiService.get(`/api/items?${query}`);
  }

  // Get item by ID
  async getItemById(id) {
    return apiService.get(`/api/items/${id}`);
  }

  // Quick search for autocomplete
  async searchItems(searchQuery, limit = 10) {
    const query = new URLSearchParams({ q: searchQuery, limit }).toString();
    return apiService.get(`/api/items/search?${query}`);
  }

  // Get all categories
  async getCategories() {
    return apiService.get('/api/items/categories');
  }

  // Create new item
  async createItem(itemData) {
    return apiService.post('/api/items', itemData);
  }

  // Bulk create items
  async bulkCreateItems(items) {
    return apiService.post('/api/items/bulk', { items });
  }

  // Update item
  async updateItem(id, itemData) {
    return apiService.put(`/api/items/${id}`, itemData);
  }

  // Deactivate item
  async deactivateItem(id) {
    return apiService.request(`/api/items/${id}/deactivate`, {
      method: 'PATCH'
    });
  }

  // Activate item
  async activateItem(id) {
    return apiService.request(`/api/items/${id}/activate`, {
      method: 'PATCH'
    });
  }

  // Delete item permanently
  async deleteItem(id) {
    return apiService.delete(`/api/items/${id}`);
  }
}

export default new ItemService();

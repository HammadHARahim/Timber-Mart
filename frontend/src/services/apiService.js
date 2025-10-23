const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

class ApiService {
  constructor() {
    this.baseUrl = API_URL;
  }

  // Get auth token from session storage
  getAuthToken() {
    return sessionStorage.getItem('auth_token');
  }

  // Set auth token in session storage
  setAuthToken(token) {
    sessionStorage.setItem('auth_token', token);
  }

  // Remove auth token from session storage
  removeAuthToken() {
    sessionStorage.removeItem('auth_token');
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const token = this.getAuthToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Auth endpoints
  async login(username, password) {
    const response = await this.post('/api/auth/login', { username, password });
    if (response.token) {
      this.setAuthToken(response.token);
    }
    return response;
  }

  async logout() {
    this.removeAuthToken();
    return { success: true };
  }

  async getCurrentUser() {
    return this.get('/api/auth/me');
  }

  // Customer endpoints
  async getCustomers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/api/customers?${query}`);
  }

  async getCustomer(id) {
    return this.get(`/api/customers/${id}`);
  }

  async createCustomer(data) {
    return this.post('/api/customers', data);
  }

  async updateCustomer(id, data) {
    return this.put(`/api/customers/${id}`, data);
  }

  async deleteCustomer(id) {
    return this.delete(`/api/customers/${id}`);
  }

  // Sync endpoints
  async syncPull(lastSyncTimestamp, deviceId) {
    return this.post('/api/sync/pull', { lastSyncTimestamp, deviceId });
  }

  async syncPush(changes, deviceId) {
    return this.post('/api/sync/push', { changes, deviceId });
  }
}

export default new ApiService();

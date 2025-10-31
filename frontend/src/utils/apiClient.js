/**
 * Centralized API client with global error handling
 */

const API_URL = import.meta.env.VITE_API_URL;

class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Make an API request with automatic error handling
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    requiresAuth = true,
    retries = 0
  } = options;

  const token = sessionStorage.getItem('auth_token');

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(requiresAuth && token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
      window.location.href = '/login';
      throw new ApiError('Session expired. Please login again.', 401);
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      throw new ApiError('You do not have permission to perform this action.', 403);
    }

    // Handle validation errors (400)
    if (response.status === 400) {
      const errorData = await response.json();
      throw new ApiError(
        errorData.error || 'Validation failed',
        400,
        errorData.details || null
      );
    }

    // Handle other error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `Request failed with status ${response.status}`,
        response.status,
        errorData.details || null
      );
    }

    return await response.json();
  } catch (error) {
    // Network errors or fetch failures
    if (error instanceof ApiError) {
      throw error;
    }

    // Retry logic for network failures
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiRequest(endpoint, { ...options, retries: retries - 1 });
    }

    throw new ApiError(
      'Network error. Please check your connection.',
      0,
      error.message
    );
  }
}

/**
 * Convenience methods for different HTTP verbs
 */
export const api = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'POST', body }),

  put: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'PUT', body }),

  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),

  patch: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'PATCH', body })
};

export { ApiError };

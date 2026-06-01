import axios from 'axios';

// Base URL of the Python Flask backend REST API
const API_BASE_URL = 'http://localhost:5000';

// Create a generic Axios client instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Visitor-related API endpoints
export const visitorApi = {
  /**
   * Registers a visitor.
   * @param {FormData} formData - Multipart form containing name, email, phone, purpose, and image.
   */
  register: (formData) => {
    return api.post('/api/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  /**
   * Fetches the complete list of registered visitors.
   */
  getAll: () => api.get('/api/visitors'),
};

// Admin-related API endpoints
export const adminApi = {
  /**
   * Validates admin username and password.
   * @param {object} credentials - { username, password }
   */
  login: (credentials) => api.post('/api/admin/login', credentials),
  
  /**
   * Retrieves all historical gate access verification logs.
   */
  getLogs: () => api.get('/api/logs'),
};

// Security Guard verification endpoints
export const securityApi = {
  /**
   * Verifies scanned QR pass along with live camera capture.
   * @param {FormData} formData - Multipart form containing visitor_id and image.
   */
  verify: (formData) => {
    return api.post('/api/verify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;

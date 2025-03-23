/**
 * Axios Configuration
 * Configured Axios instance for API requests
 */

import axios from 'axios';

// Base API client
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      // window.location.href = '/login';
    }
    
    // Handle forbidden errors (403)
    if (error.response?.status === 403) {
      console.error('Forbidden resource');
    }
    
    // Handle server errors (500)
    if (error.response?.status && error.response?.status >= 500) {
      console.error('Server error', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Handle different error status codes
    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
          break;
          
        case 403:
          toast.error('Access denied. You do not have permission to perform this action.');
          break;
          
        case 404:
          toast.error('Resource not found.');
          break;
          
        case 422:
          // Validation errors
          if (response.data && response.data.errors) {
            const errors = response.data.errors;
            if (Array.isArray(errors)) {
              errors.forEach(err => toast.error(err.msg || err.message));
            } else {
              toast.error(response.data.message || 'Validation error');
            }
          }
          break;
          
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          if (response.data && response.data.message) {
            toast.error(response.data.message);
          } else {
            toast.error('An unexpected error occurred.');
          }
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other errors
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    profile: '/auth/profile',
    changePassword: '/auth/change-password',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verify: '/auth/verify',
  },
  
  // User endpoints
  users: {
    list: '/users',
    create: '/users',
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
    get: (id) => `/users/${id}`,
    statistics: '/users/statistics',
    search: '/users/search',
  },
  
  // Donation endpoints
  donations: {
    list: '/donations',
    create: '/donations',
    update: (id) => `/donations/${id}`,
    delete: (id) => `/donations/${id}`,
    get: (id) => `/donations/${id}`,
    statistics: '/donations/statistics',
    search: '/donations/search',
    byUser: (userId) => `/donations/user/${userId}`,
    schedule: '/donations/schedule',
  },
  
  // Notification endpoints
  notifications: {
    list: '/notifications',
    send: '/notifications/send',
    templates: '/notifications/templates',
    create: '/notifications/templates',
    update: (id) => `/notifications/templates/${id}`,
    delete: (id) => `/notifications/templates/${id}`,
  },
};

export default api;
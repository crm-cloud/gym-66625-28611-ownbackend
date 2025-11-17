import axios from 'axios';

// Base URL without any API prefix
const BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001').replace(/\/+$/, '');

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    // Skip for auth endpoints
    if (config.url?.includes('/auth/')) {
      return config;
    }
    
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[axios] 🔐 Token attached to request:', {
        url: config.url,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
      });
    } else {
      console.warn('[axios] ⚠️ No token found in localStorage for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors and unwrapping responses
api.interceptors.response.use(
  (response) => {
    // Unwrap the response if it has the standard format { success, data, ... }
    const hasWrappedFormat = response.data && 
                            typeof response.data === 'object' && 
                            'success' in response.data && 
                            'data' in response.data;
    
    if (hasWrappedFormat) {
      console.log('[axios] 📦 Unwrapping response:', {
        url: response.config?.url,
        hasData: 'data' in response.data,
        hasSuccess: 'success' in response.data,
        dataType: typeof response.data.data,
        isArray: Array.isArray(response.data.data),
        dataLength: Array.isArray(response.data.data) ? response.data.data.length : 'N/A'
      });
      // Return the inner data directly
      return {
        ...response,
        data: response.data.data
      };
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('access_token');
      delete api.defaults.headers.common['Authorization'];
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
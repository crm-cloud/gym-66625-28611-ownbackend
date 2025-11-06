import axios from 'axios';

// Base URL without any API prefix
const BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001').replace(/\/+$/, '');

export const api = axios.create({
  baseURL: BASE_URL, // Base URL without /api/v1
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for auth tokens and URL formatting
api.interceptors.request.use((config) => {
  // Skip modifying config for these endpoints (they don't need the /api/v1 prefix)
  const publicEndpoints = [
    '/health',
    '/api-docs',
    '/api-docs/json'
  ];
  
  // Auth endpoints that need special handling
  const authEndpoints = [
    'auth/login',
    'auth/register',
    'auth/refresh',
    'auth/verify-email',
    'auth/request-password-reset',
    'auth/reset-password',
    'auth/me',
    'auth/logout',
    'auth/change-password'
  ].map(ep => `/${ep}`);
  
  // Combine all public endpoints
  const allPublicEndpoints = [...publicEndpoints, ...authEndpoints];

  // Get token from localStorage
  const token = localStorage.getItem('access_token');
  
  // Always set the token if it exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Handle URL formatting
  if (config.url && !config.url.startsWith('http')) {
    // Remove any leading slashes to prevent double slashes
    let cleanUrl = config.url.replace(/^\/+/, '');
    
    // Check if this is a public or auth endpoint
    const isPublic = allPublicEndpoints.some(ep => 
      cleanUrl === ep.replace(/^\/+/, '') || 
      cleanUrl.startsWith(ep.replace(/^\/+/, '') + '/')
    );
    
    // Add /api/ prefix only if:
    // 1. Not a public endpoint
    // 2. Doesn't already start with api/
    // 3. Not an auth endpoint
    if (!isPublic && !cleanUrl.startsWith('api/') && !authEndpoints.some(ep => cleanUrl.startsWith(ep.replace(/^\/+/, '')))) {
      cleanUrl = `api/${cleanUrl}`;
    }
    
    // Update the URL and ensure no double slashes
    config.url = `/${cleanUrl}`.replace(/([^:]\/)\/+/g, '$1');
    
    console.log('[Axios] Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasToken: !!token,
      isPublic
    });
  }

  return config;
});

// Helper function to handle logout
const handleLogout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  delete api.defaults.headers.common['Authorization'];
  
  // Only redirect if not already on login page
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
};

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    // You can perform actions on successful responses here
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          console.warn('No refresh token available, logging out...');
          handleLogout();
          return Promise.reject(error);
        }

        console.log('Attempting to refresh access token...');
        
        // Try to refresh the access token using the new path
        const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refresh_token: refreshToken
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        });

        console.log('Token refresh response:', response.data);
        
        const responseData = response.data.data || response.data;
        const { access_token, refresh_token } = responseData || {};
        
        if (!access_token) {
          console.error('No access token in refresh response:', responseData);
          throw new Error('No access token in refresh response');
        }

        console.log('New access token received, updating storage and retrying request...');
        
        // Store the new tokens
        localStorage.setItem('access_token', access_token);
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }

        // Update the default authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        // Update the original request config
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        } else {
          originalRequest.headers = { Authorization: `Bearer ${access_token}` };
        }
        
        // Retry the original request with the new token
        console.log('Retrying original request with new token...');
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error - backend may be offline');
    }

    return Promise.reject(error);
  }
);

export default api;
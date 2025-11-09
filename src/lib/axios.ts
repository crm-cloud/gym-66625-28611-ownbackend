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

// Flag to prevent multiple token refresh attempts
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    // Skip for auth endpoints to prevent infinite loops
    if (config.url?.includes('/auth/')) {
      return config;
    }
    
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // If no token is found, redirect to login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject('No authentication token found');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => {
    // If we have a new token in the response, save it
    if (response?.data) {
      let access_token, refresh_token;
      
      // Handle different response formats
      if (response.data.data) {
        access_token = response.data.data.access_token || response.data.data.accessToken;
        refresh_token = response.data.data.refresh_token || response.data.data.refreshToken;
      } else {
        access_token = response.data.access_token || response.data.accessToken;
        refresh_token = response.data.refresh_token || response.data.refreshToken;
      }
      
      if (access_token) {
        localStorage.setItem('access_token', access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is not a 401 or it's a retry request, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, add to queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Mark that we're refreshing the token
    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Make refresh token request
      const response = await axios.post(
        `${BASE_URL}/api/auth/refresh`,
        { refresh_token: refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          withCredentials: true
        } as any
      );

      // Handle different response formats
      let access_token, refresh_token;
      
      if (response.data && response.data.data) {
        // Response format: { data: { access_token, refresh_token } }
        access_token = response.data.data.access_token || response.data.data.accessToken;
        refresh_token = response.data.data.refresh_token || response.data.data.refreshToken;
      } else {
        // Response format: { access_token, refresh_token }
        access_token = response.data.access_token || response.data.accessToken;
        refresh_token = response.data.refresh_token || response.data.refreshToken;
      }

      if (!access_token) {
        throw new Error('No access token in refresh response');
      }

      // Store new tokens
      localStorage.setItem('access_token', access_token);
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
      }

      // Update auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      originalRequest.headers.Authorization = `Bearer ${access_token}`;

      // Process queued requests
      processQueue(null, access_token);

      // Retry original request
      return api(originalRequest);
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      
      // Clear tokens and auth state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      
      // Process any queued requests with the error
      processQueue(refreshError, null);
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        // Use window.location.assign to ensure a full page reload
        window.location.assign('/login');
      }
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
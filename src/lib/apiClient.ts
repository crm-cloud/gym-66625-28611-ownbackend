import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleApiError } from './errorHandler';

class ApiClient {
  private client: AxiosInstance;
  private retryCount = 0;
  private readonly maxRetries = 2;
  private readonly retryDelay = 1000; // 1 second

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If we get a 429 and haven't exceeded max retries
        if (error.response?.status === 429 && this.retryCount < this.maxRetries) {
          this.retryCount++;
          
          // Calculate delay with exponential backoff
          const delay = this.retryDelay * Math.pow(2, this.retryCount - 1);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Retry the request
          return this.client(originalRequest);
        }
        
        // Reset retry counter
        this.retryCount = 0;
        
        // Handle the error
        return handleApiError(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.client.get<T>(url, config);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.client.post<T>(url, data, config);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.client.put<T>(url, data, config);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.client.delete<T>(url, config);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

// Create a singleton instance
const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || '/api');

export default apiClient;

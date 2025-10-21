import { api } from '@/lib/axios';
import { AxiosRequestConfig } from 'axios';

/**
 * Base API Service
 * Provides common CRUD operations for all services
 */
export class BaseService<T = any> {
  constructor(protected readonly resource: string) {}

  /**
   * Get all resources with optional filters
   */
  async getAll(params?: Record<string, any>, config?: AxiosRequestConfig): Promise<T[]> {
    const { data } = await api.get<T[]>(`/api/${this.resource}`, {
      params,
      ...config
    });
    return data;
  }

  /**
   * Get a single resource by ID
   */
  async getById(id: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await api.get<T>(`/api/${this.resource}/${id}`, config);
    return data;
  }

  /**
   * Create a new resource
   */
  async create(payload: Partial<T>, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await api.post<T>(`/api/${this.resource}`, payload, config);
    return data;
  }

  /**
   * Update an existing resource
   */
  async update(id: string, payload: Partial<T>, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await api.patch<T>(`/api/${this.resource}/${id}`, payload, config);
    return data;
  }

  /**
   * Delete a resource
   */
  async delete(id: string, config?: AxiosRequestConfig): Promise<void> {
    await api.delete(`/api/${this.resource}/${id}`, config);
  }

  /**
   * Build query string from params
   */
  protected buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(filteredParams as any).toString();
    return query ? `?${query}` : '';
  }

  /**
   * Execute a custom GET request
   */
  protected async get<R = any>(path: string, params?: Record<string, any>, config?: AxiosRequestConfig): Promise<R> {
    const { data } = await api.get<R>(`/api/${this.resource}${path}`, {
      params,
      ...config
    });
    return data;
  }

  /**
   * Execute a custom POST request
   */
  protected async post<R = any>(path: string, payload?: any, config?: AxiosRequestConfig): Promise<R> {
    const { data } = await api.post<R>(`/api/${this.resource}${path}`, payload, config);
    return data;
  }

  /**
   * Execute a custom PUT request
   */
  protected async put<R = any>(path: string, payload?: any, config?: AxiosRequestConfig): Promise<R> {
    const { data } = await api.put<R>(`/api/${this.resource}${path}`, payload, config);
    return data;
  }

  /**
   * Execute a custom PATCH request
   */
  protected async patch<R = any>(path: string, payload?: any, config?: AxiosRequestConfig): Promise<R> {
    const { data } = await api.patch<R>(`/api/${this.resource}${path}`, payload, config);
    return data;
  }
}

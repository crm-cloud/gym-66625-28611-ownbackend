import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions, QueryKey } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

// Define API response type
interface ApiResponse<T> {
  data: T;
  message?: string;
  [key: string]: unknown;
}

// Define error response type
interface ApiErrorResponse {
  status?: number;
  message: string;
  response?: {
    status: number;
    statusText: string;
    data: {
      message?: string;
      [key: string]: any;
    };
  };
  config?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
  };
}

import { api } from '@/lib/axios';
import { toast } from '@/hooks/use-toast';

// Generic query hook
export const useApiQuery = <TData,>(
  key: QueryKey,
  endpoint: string,
  options?: Omit<UseQueryOptions<TData, ApiErrorResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<TData, ApiErrorResponse>({
    queryKey: key,
    queryFn: async (): Promise<TData> => {
      try {
        // Remove any leading/trailing slashes and normalize the endpoint
        const normalizedEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
        
        // Only add /api/ if the endpoint doesn't already start with it
        const formattedEndpoint = normalizedEndpoint.startsWith('api/') || 
                                normalizedEndpoint.startsWith('auth/') ||
                                normalizedEndpoint.startsWith('public/')
                                ? `/${normalizedEndpoint}` // Already has the correct prefix
                                : `/api/${normalizedEndpoint}`; // Add the prefix
        
        console.log(`[useApiQuery] Fetching from: ${formattedEndpoint}`);
        
        const { data } = await api.get(formattedEndpoint);
        return data;
      } catch (err) {
        const error = err as ApiErrorResponse;
        console.error(`[useApiQuery] API Error (${endpoint}):`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        throw error;
      }
    },
    retry: 1, // Retry once on failure
    ...options
  });
};

// Generic mutation hook with automatic error handling
export const useApiMutation = <TData, TVariables = Record<string, unknown>>(
  endpoint: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post',
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: ApiErrorResponse, variables: TVariables) => void;
    invalidateQueries?: string[][];
    successMessage?: string;
  }
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, ApiErrorResponse, TVariables>({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      try {
        // Ensure endpoint starts with /api/v1/ if it's not an auth endpoint
        const formattedEndpoint = endpoint.startsWith('auth/') || 
                               endpoint.startsWith('/auth/') ||
                               endpoint.startsWith('api/') ||
                               endpoint.startsWith('/api/') 
                               ? endpoint 
                               : `api/v1/${endpoint}`;
        
        console.log(`Mutating (${method}): ${formattedEndpoint}`, variables); // Debug log
        
        const { data } = await api[method](formattedEndpoint, variables);
        return data;
      } catch (error) {
        console.error(`API Mutation Error (${method} ${endpoint}):`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      if (options?.successMessage) {
        toast({
          title: 'Success',
          description: options.successMessage,
        });
      }
      options?.onSuccess?.(data, variables);
    },
    onError: (error: ApiErrorResponse, variables: TVariables) => {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      console.error('API Error:', errorMessage, error);
      
      // Only show error toast if it's not a 401 (handled by axios interceptor)
      if (error.response?.status !== 401) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      options?.onError?.(error, variables);
    }
  });
};

// Utility for dynamic endpoint building
export const buildEndpoint = (path: string, params?: Record<string, unknown>): string => {
  if (!params) return path;
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
  );
  const query = new URLSearchParams(filteredParams as Record<string, string>).toString();
  return query ? `${path}?${query}` : path;
};

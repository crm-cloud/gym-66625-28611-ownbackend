import { useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

export const useApi = <T = any, D = any>(
  method: HttpMethod,
  url: string,
  options: UseApiOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const execute = useCallback(
    async (requestData?: D, params?: Record<string, any>) => {
      setLoading(true);
      setError(null);

      try {
        let response;
        
        switch (method.toLowerCase()) {
          case 'get':
            response = await apiClient.get<T>(url, { params });
            break;
          case 'post':
            response = await apiClient.post<T>(url, requestData, { params });
            break;
          case 'put':
            response = await apiClient.put<T>(url, requestData, { params });
            break;
          case 'delete':
            response = await apiClient.delete<T>(url, { params, data: requestData });
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        setData(response.data);
        
        if (options.onSuccess) {
          options.onSuccess(response.data);
        }
        
        if (options.showSuccessToast && options.successMessage) {
          // Using toast from sonner
          import('sonner').then(({ toast }) => {
            toast.success(options.successMessage);
          });
        }
        
        return response.data;
      } catch (err: any) {
        setError(err);
        
        if (options.onError) {
          options.onError(err);
        }
        
        // Re-throw the error so it can be caught by error boundaries
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [method, url, options]
  );

  return { execute, data, error, loading };
};

// Example usage:
/*
const { execute: fetchData, data, loading, error } = useApi<MyDataType>('get', '/api/data', {
  onSuccess: (data) => console.log('Data loaded:', data),
  onError: (error) => console.error('Error:', error),
  showSuccessToast: true,
  successMessage: 'Data loaded successfully!'
});

// In your component:
useEffect(() => {
  fetchData();
}, [fetchData]);

// Or with parameters:
const handleSubmit = async (formData) => {
  try {
    await fetchData(formData);
  } catch (error) {
    // Handle error if needed
  }
};
*/

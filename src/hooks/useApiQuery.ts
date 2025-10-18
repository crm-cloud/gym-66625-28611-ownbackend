import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from '@/hooks/use-toast';

// Generic query hook
export const useApiQuery = <TData = any>(
  key: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<TData>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get(endpoint);
      return data;
    },
    ...options
  });
};

// Generic mutation hook with automatic error handling
export const useApiMutation = <TData = any, TVariables = any>(
  endpoint: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post',
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: any, variables: TVariables) => void;
    invalidateQueries?: string[][];
    successMessage?: string;
  }
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const { data } = await api[method](endpoint, variables);
      return data;
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
    onError: (error: any, variables) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || error.message || 'An error occurred',
        variant: 'destructive'
      });
      options?.onError?.(error, variables);
    }
  });
};

// Utility for dynamic endpoint building
export const buildEndpoint = (path: string, params?: Record<string, any>) => {
  if (!params) return path;
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
  );
  const query = new URLSearchParams(filteredParams as any).toString();
  return query ? `${path}?${query}` : path;
};

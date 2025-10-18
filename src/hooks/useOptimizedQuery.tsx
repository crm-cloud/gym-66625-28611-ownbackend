import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useApiError } from '@/hooks/useApiError';

// Enhanced query hook with automatic error handling and optimizations
export function useOptimizedQuery<TData = unknown, TError = Error>(
  key: string | string[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  const { handleError } = useApiError();
  
  const optimizedOptions = useMemo(() => ({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount: number, error: any) => {
      if (error?.status === 404 || error?.status === 401) return false;
      return failureCount < 2;
    },
    onError: handleError,
    ...options,
  }), [key, queryFn, handleError, options]);

  return useQuery(optimizedOptions);
}

// Enhanced mutation hook with optimistic updates
export function useOptimizedMutation<TData = unknown, TError = Error, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables> & {
    invalidateQueries?: string[];
    optimisticUpdate?: {
      queryKey: string | string[];
      updater: (oldData: any, variables: TVariables) => any;
    };
  }
) {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();

  const optimizedOptions = useMemo(() => ({
    mutationFn,
    onSuccess: (data: TData, variables: TVariables) => {
      // Invalidate specified queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
      options?.onSuccess?.(data, variables, undefined);
    },
    onMutate: async (variables: TVariables) => {
      if (options?.optimisticUpdate) {
        const { queryKey, updater } = options.optimisticUpdate;
        const key = Array.isArray(queryKey) ? queryKey : [queryKey];
        
        await queryClient.cancelQueries({ queryKey: key });
        const previousData = queryClient.getQueryData(key);
        
        queryClient.setQueryData(key, (old: any) => updater(old, variables));
        
        return { previousData, queryKey: key };
      }
      return options?.onMutate?.(variables);
    },
    onError: (error: TError, variables: TVariables, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      handleError(error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  }), [mutationFn, queryClient, handleError, options]);

  return useMutation(optimizedOptions);
}

// Prefetch utility for improved UX
export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetchQuery = useCallback(
    (key: string | string[], queryFn: () => Promise<any>) => {
      queryClient.prefetchQuery({
        queryKey: Array.isArray(key) ? key : [key],
        queryFn,
        staleTime: 10 * 60 * 1000, // 10 minutes for prefetched data
      });
    },
    [queryClient]
  );

  return { prefetchQuery };
}
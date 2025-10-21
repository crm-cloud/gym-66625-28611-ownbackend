import { QueryClient } from '@tanstack/react-query';

/**
 * Cache Utilities
 * Helper functions for managing React Query cache
 */

export const cacheUtils = {
  /**
   * Default stale time (5 minutes)
   */
  DEFAULT_STALE_TIME: 5 * 60 * 1000,

  /**
   * Default cache time (10 minutes)
   */
  DEFAULT_CACHE_TIME: 10 * 60 * 1000,

  /**
   * Invalidate multiple query keys
   */
  invalidateQueries: (queryClient: QueryClient, keys: (string | string[])[]) => {
    keys.forEach(key => {
      queryClient.invalidateQueries({ 
        queryKey: Array.isArray(key) ? key : [key] 
      });
    });
  },

  /**
   * Prefetch data for improved UX
   */
  prefetchQuery: async (
    queryClient: QueryClient,
    queryKey: string[],
    queryFn: () => Promise<any>
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: cacheUtils.DEFAULT_STALE_TIME,
    });
  },

  /**
   * Set query data in cache
   */
  setQueryData: <T>(
    queryClient: QueryClient,
    queryKey: string[],
    data: T
  ) => {
    queryClient.setQueryData(queryKey, data);
  },

  /**
   * Get query data from cache
   */
  getQueryData: <T>(
    queryClient: QueryClient,
    queryKey: string[]
  ): T | undefined => {
    return queryClient.getQueryData<T>(queryKey);
  },

  /**
   * Remove query from cache
   */
  removeQueries: (queryClient: QueryClient, queryKey: string[]) => {
    queryClient.removeQueries({ queryKey });
  },

  /**
   * Optimistic update helper
   */
  optimisticUpdate: async <T>(
    queryClient: QueryClient,
    queryKey: string[],
    updateFn: (old: T | undefined) => T,
    rollbackOnError: boolean = true
  ): Promise<{ previousData: T | undefined }> => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey });

    // Snapshot the previous value
    const previousData = queryClient.getQueryData<T>(queryKey);

    // Optimistically update
    queryClient.setQueryData<T>(queryKey, updateFn);

    return { previousData };
  },

  /**
   * Rollback optimistic update
   */
  rollbackUpdate: <T>(
    queryClient: QueryClient,
    queryKey: string[],
    previousData: T | undefined
  ) => {
    queryClient.setQueryData(queryKey, previousData);
  },
};

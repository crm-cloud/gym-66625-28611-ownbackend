import { useApiQuery, buildEndpoint } from './useApiQuery';

export const useSystemMetrics = (params?: {
  start_date?: string;
  end_date?: string;
  metric_type?: string;
}) => {
  const endpoint = buildEndpoint('/api/system/metrics', params);
  return useApiQuery(['system-metrics', JSON.stringify(params || {})], endpoint, {
    refetchInterval: 60000,
    staleTime: 30000
  });
};

export const usePerformanceMetrics = () => {
  return useApiQuery(
    ['performance-metrics'],
    '/api/system/performance',
    {
      refetchInterval: 30000,
      staleTime: 10000
    }
  );
};

export const useResourceUsage = () => {
  return useApiQuery(
    ['resource-usage'],
    '/api/system/resources',
    {
      refetchInterval: 30000,
      staleTime: 10000
    }
  );
};

export const useApiMetrics = (params?: {
  start_date?: string;
  end_date?: string;
}) => {
  const endpoint = buildEndpoint('/api/system/api-metrics', params);
  return useApiQuery(['api-metrics', JSON.stringify(params || {})], endpoint);
};

// Keep compatibility with old interface
export const useBranchMetrics = () => {
  return useApiQuery(['branch-metrics'], '/api/analytics/branches/metrics');
};

export const useUserMetrics = () => {
  return useApiQuery(['user-metrics'], '/api/analytics/users/metrics');
};

export const useRevenueMetrics = () => {
  return useApiQuery(['revenue-metrics'], '/api/analytics/revenue/metrics');
};

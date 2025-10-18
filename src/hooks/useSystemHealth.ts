import { useApiQuery } from './useApiQuery';

export interface SystemEvent {
  id: string;
  event_type: 'info' | 'warning' | 'error' | 'success';
  event_category: 'system' | 'database' | 'backup' | 'security' | 'performance' | 'user_activity';
  title: string;
  description?: string;
  metadata: any;
  severity: number;
  resolved: boolean;
  created_at: string;
}

export const useSystemEvents = (limit = 10) => {
  return useApiQuery<SystemEvent[]>(
    ['system-events', limit.toString()],
    `/api/system/events?limit=${limit}`
  );
};

export const useSystemHealth = () => {
  return useApiQuery(
    ['system-health'],
    '/api/system/health',
    {
      refetchInterval: 30000,
      staleTime: 10000
    }
  );
};

export const useDatabaseStatus = () => {
  return useApiQuery(
    ['database-status'],
    '/api/system/database-status',
    {
      refetchInterval: 60000,
      staleTime: 30000
    }
  );
};

export const useServiceStatus = () => {
  return useApiQuery(
    ['service-status'],
    '/api/system/services',
    {
      refetchInterval: 30000,
      staleTime: 10000
    }
  );
};

export const useSystemLogs = (params?: {
  level?: string;
  limit?: number;
}) => {
  const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  return useApiQuery(
    ['system-logs', JSON.stringify(params || {})],
    `/api/system/logs${query}`
  );
};

export { useSystemMetrics, usePerformanceMetrics } from './useSystemMetrics';

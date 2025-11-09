import { useApiQuery } from './useApiQuery';
import { DashboardStats, ClassPopularity, RevenueAnalytics, MembershipAnalytics } from '@/types/analytics';

export interface RevenueData {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface MembershipData {
  month: string;
  new: number;
  active: number;
  expired: number;
}

interface AnalyticsFilters {
  branchId?: string;
  gymId?: string;
  startDate?: string;
  endDate?: string;
}

export const useDashboardStats = (filters?: AnalyticsFilters) => {
  return useApiQuery<DashboardStats>(
    ['analytics', 'dashboard', filters],
    `/api/analytics/dashboard?${new URLSearchParams(filters as Record<string, string>).toString()}`,
    {
      enabled: true,
      staleTime: 60000 // 1 minute
    }
  );
};

export const useRevenueAnalytics = (filters?: AnalyticsFilters) => {
  return useApiQuery<RevenueData[]>(
    ['analytics', 'revenue', filters],
    `/api/analytics/revenue?${new URLSearchParams(filters as Record<string, string>).toString()}`,
    {
      enabled: true,
      staleTime: 300000 // 5 minutes
    }
  );
};

export const useMembershipAnalytics = (filters?: AnalyticsFilters) => {
  return useApiQuery<MembershipData[]>(
    ['analytics', 'membership', filters],
    `/api/analytics/membership?${new URLSearchParams(filters as Record<string, string>).toString()}`,
    {
      enabled: true,
      staleTime: 300000
    }
  );
};

export const useClassPopularity = (filters?: AnalyticsFilters) => {
  return useApiQuery<ClassPopularity[]>(
    ['analytics', 'classes', filters],
    `/api/analytics/classes?${new URLSearchParams(filters as Record<string, string>).toString()}`,
    {
      enabled: true,
      staleTime: 300000
    }
  );
};

// Platform analytics for super admin
export const usePlatformAnalytics = (filters?: Omit<AnalyticsFilters, 'branchId' | 'gymId'>) => {
  return useApiQuery<{
    totalGyms: number;
    totalBranches: number;
    totalMembers: number;
    totalRevenue: number;
    growthRate: number;
    topPerformingGyms: Array<{
      gymId: string;
      gymName: string;
      revenue: number;
      memberCount: number;
    }>;
    revenueByMonth: Array<{
      month: string;
      revenue: number;
    }>;
  }>(
    ['platform', 'analytics', filters],
    `/api/platform/analytics?${new URLSearchParams(filters as Record<string, string>).toString()}`,
    {
      enabled: true,
      staleTime: 300000
    }
  );
};

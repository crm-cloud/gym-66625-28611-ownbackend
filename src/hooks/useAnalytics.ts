import { useApiQuery, buildEndpoint } from './useApiQuery';

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  monthlyRevenue: number;
  classAttendance: number;
  memberRetention: number;
  growthRate: number;
}

interface RevenueAnalytics {
  month: string;
  membership: number;
  personal: number;
  retail: number;
  total: number;
}

interface MembershipAnalytics {
  month: string;
  active: number;
  new: number;
  churned: number;
  retention: number;
}

interface AttendanceAnalytics {
  date: string;
  checkins: number;
  classAttendance: number;
  peakHour: string;
}

interface ClassPopularity {
  name: string;
  value: number;
  attendance: number;
  cancellationRate: number;
  color?: string;
}

export const useDashboardStats = (params?: {
  branchId?: string;
  gymId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const endpoint = buildEndpoint('/api/analytics/dashboard', params);
  return useApiQuery<DashboardStats>(
    ['analytics', 'dashboard', JSON.stringify(params || {})],
    endpoint
  );
};

export const useRevenueAnalytics = (params?: {
  branchId?: string;
  gymId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const endpoint = buildEndpoint('/api/analytics/revenue', params);
  return useApiQuery<RevenueAnalytics[]>(
    ['analytics', 'revenue', JSON.stringify(params || {})],
    endpoint
  );
};

export const useMembershipAnalytics = (params?: {
  branchId?: string;
  gymId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const endpoint = buildEndpoint('/api/analytics/memberships', params);
  return useApiQuery<MembershipAnalytics[]>(
    ['analytics', 'memberships', JSON.stringify(params || {})],
    endpoint
  );
};

export const useAttendanceAnalytics = (params?: {
  branchId?: string;
  gymId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const endpoint = buildEndpoint('/api/analytics/attendance', params);
  return useApiQuery<AttendanceAnalytics[]>(
    ['analytics', 'attendance', JSON.stringify(params || {})],
    endpoint
  );
};

export const useClassPopularity = (params?: {
  branchId?: string;
  gymId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const endpoint = buildEndpoint('/api/analytics/classes', params);
  return useApiQuery<ClassPopularity[]>(
    ['analytics', 'classes', JSON.stringify(params || {})],
    endpoint
  );
};

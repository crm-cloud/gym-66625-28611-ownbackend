import { useApiQuery, buildEndpoint } from './useApiQuery';

interface PlatformKPIs {
  totalGyms: number;
  totalBranches: number;
  totalAdmins: number;
  totalMembers: number;
  totalTrainers: number;
  totalStaff: number;
  activeMemberships: number;
  expiredMemberships: number;
  membershipActivePercent: number;
  totalRevenue: number;
  gstRevenue: number;
  nonGstRevenue: number;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
}

interface AdminSummary {
  id: string;
  name: string;
  email: string;
  gymCount: number;
  branchCount: number;
  memberCount: number;
  trainerCount: number;
  totalRevenue: number;
  activeMemberships: number;
  expiredMemberships: number;
}

interface BranchSummary {
  id: string;
  name: string;
  gymName: string;
  adminName: string;
  memberCount: number;
  trainerCount: number;
  staffCount: number;
  revenue: number;
  leads: number;
  convertedLeads: number;
}

export const usePlatformAnalytics = (params?: {
  start_date?: string;
  end_date?: string;
  gym_id?: string;
}) => {
  const endpoint = buildEndpoint('/api/analytics/platform', params);
  const query = useApiQuery<{
    platformKPIs: PlatformKPIs;
    adminSummaries: AdminSummary[];
    branchSummaries: BranchSummary[];
  }>(['platform-analytics', JSON.stringify(params || {})], endpoint);
  
  return {
    platformKPIs: query.data?.platformKPIs,
    adminSummaries: query.data?.adminSummaries,
    branchSummaries: query.data?.branchSummaries,
    isLoading: query.isLoading
  };
};

export const useRevenueAnalytics = (params?: {
  start_date?: string;
  end_date?: string;
  branch_id?: string;
}) => {
  const endpoint = buildEndpoint('/api/analytics/revenue', params);
  return useApiQuery(['revenue-analytics', JSON.stringify(params || {})], endpoint);
};

export const useMembershipAnalytics = (params?: {
  start_date?: string;
  end_date?: string;
  branch_id?: string;
}) => {
  const endpoint = buildEndpoint('/api/analytics/memberships', params);
  return useApiQuery(['membership-analytics', JSON.stringify(params || {})], endpoint);
};

export const useAttendanceAnalytics = (params?: {
  start_date?: string;
  end_date?: string;
  branch_id?: string;
}) => {
  const endpoint = buildEndpoint('/api/analytics/attendance', params);
  return useApiQuery(['attendance-analytics', JSON.stringify(params || {})], endpoint);
};

export const useTrainerPerformance = (params?: {
  start_date?: string;
  end_date?: string;
  trainer_id?: string;
}) => {
  const endpoint = buildEndpoint('/api/analytics/trainers', params);
  return useApiQuery(['trainer-performance', JSON.stringify(params || {})], endpoint);
};

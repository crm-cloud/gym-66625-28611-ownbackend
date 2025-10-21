import { useApiQuery, useApiMutation } from './useApiQuery';
import { TrackEventInput, EventsQueryParams } from '@/types/analytics';

export const useAnalyticsEvents = (params?: EventsQueryParams) => {
  return useApiQuery(
    ['analytics-events', JSON.stringify(params)],
    `/api/analytics/events${params ? '?' + new URLSearchParams(params as any).toString() : ''}`
  );
};

export const useMemberAnalytics = (memberId: string, params?: { from_date?: string; to_date?: string }) => {
  return useApiQuery(
    ['member-analytics', memberId, JSON.stringify(params)],
    `/api/analytics/member/${memberId}${params ? '?' + new URLSearchParams(params as any).toString() : ''}`,
    { enabled: !!memberId }
  );
};

export const useBranchAnalytics = (branchId: string, params?: { from_date?: string; to_date?: string }) => {
  return useApiQuery(
    ['branch-analytics', branchId, JSON.stringify(params)],
    `/api/analytics/branch/${branchId}${params ? '?' + new URLSearchParams(params as any).toString() : ''}`,
    { enabled: !!branchId }
  );
};

export const useTrainerAnalytics = (trainerId: string, params?: { from_date?: string; to_date?: string }) => {
  return useApiQuery(
    ['trainer-analytics', trainerId, JSON.stringify(params)],
    `/api/analytics/trainer/${trainerId}${params ? '?' + new URLSearchParams(params as any).toString() : ''}`,
    { enabled: !!trainerId }
  );
};

export const useTrackEvent = () => {
  return useApiMutation<any, TrackEventInput>(
    '/api/analytics/events',
    'post',
    {
      invalidateQueries: [['analytics-events']],
      successMessage: 'Event tracked successfully'
    }
  );
};

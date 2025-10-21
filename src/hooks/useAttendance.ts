import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export const useAttendance = (filters?: { 
  memberId?: string;
  branchId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const endpoint = buildEndpoint('/api/attendance', filters);
  return useApiQuery<any>(['attendance', filters?.memberId ?? 'all', filters?.branchId ?? 'all', filters?.startDate ?? '', filters?.endDate ?? ''], endpoint);
};

export const useAttendanceSummary = (memberId: string) => {
  return useApiQuery(
    ['attendance-summary', memberId],
    `/api/attendance/member/${memberId}/summary`,
    { enabled: !!memberId }
  );
};

export const useCheckIn = () => {
  return useApiMutation('/api/attendance/check-in', 'post', {
    invalidateQueries: [['attendance']],
    successMessage: 'Check-in successful',
  });
};

export const useCheckOut = () => {
  return useApiMutation('/api/attendance/check-out', 'post', {
    invalidateQueries: [['attendance']],
    successMessage: 'Check-out successful',
  });
};

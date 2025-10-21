import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export const useMemberProgress = (memberId: string) => {
  return useApiQuery(
    ['member-progress', memberId],
    `/api/member-progress/${memberId}`,
    { enabled: !!memberId }
  );
};

export const useMemberProgressHistory = (memberId: string, filters?: {
  startDate?: string;
  endDate?: string;
}) => {
  const endpoint = buildEndpoint(`/api/member-progress/${memberId}/history`, filters);
  return useApiQuery<any>(
    ['member-progress-history', memberId, filters?.startDate ?? '', filters?.endDate ?? ''],
    endpoint,
    { enabled: !!memberId }
  );
};

export const useCreateProgressEntry = () => {
  return useApiMutation('/api/member-progress', 'post', {
    invalidateQueries: [['member-progress']],
    successMessage: 'Progress entry created successfully',
  });
};

export const useUpdateProgressEntry = (entryId: string) => {
  return useApiMutation(`/api/member-progress/${entryId}`, 'put', {
    invalidateQueries: [['member-progress']],
    successMessage: 'Progress entry updated successfully',
  });
};

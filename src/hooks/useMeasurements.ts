import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export const useMemberMeasurements = (memberId?: string) => {
  const endpoint = buildEndpoint('/api/members/measurements', { memberId });
  return useApiQuery(
    ['member-measurements', memberId || 'all'],
    endpoint,
    { enabled: !!memberId }
  );
};

export const useCreateMeasurement = () => {
  return useApiMutation('/api/members/measurements', 'post', {
    invalidateQueries: [['member-measurements']],
    successMessage: 'Measurement recorded successfully',
  });
};

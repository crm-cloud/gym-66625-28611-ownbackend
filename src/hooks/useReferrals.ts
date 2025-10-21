import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export const useReferrals = (filters?: { 
  referrerId?: string;
  status?: string;
}) => {
  const endpoint = buildEndpoint('/api/referrals', filters);
  return useApiQuery<any>(['referrals', filters?.referrerId ?? 'all', filters?.status ?? 'all'], endpoint);
};

export const useReferralStats = (memberId: string) => {
  return useApiQuery(
    ['referral-stats', memberId],
    `/api/referrals/member/${memberId}/stats`,
    { enabled: !!memberId }
  );
};

export const useCreateReferral = () => {
  return useApiMutation('/api/referrals', 'post', {
    invalidateQueries: [['referrals']],
    successMessage: 'Referral created successfully',
  });
};

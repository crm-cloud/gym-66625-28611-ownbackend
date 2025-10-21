import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export const useMembershipPlans = (filters?: { 
  branchId?: string;
  isActive?: boolean;
}) => {
  const endpoint = buildEndpoint('/api/membership-plans', filters);
  return useApiQuery<any>(['membership-plans', filters?.branchId ?? 'all', String(filters?.isActive ?? 'all')], endpoint);
};

export const useMembershipPlanById = (planId: string) => {
  return useApiQuery(
    ['membership-plans', planId],
    `/api/membership-plans/${planId}`,
    { enabled: !!planId }
  );
};

export const useCreateMembershipPlan = () => {
  return useApiMutation('/api/membership-plans', 'post', {
    invalidateQueries: [['membership-plans']],
    successMessage: 'Membership plan created successfully',
  });
};

export const useUpdateMembershipPlan = (planId: string) => {
  return useApiMutation(`/api/membership-plans/${planId}`, 'put', {
    invalidateQueries: [['membership-plans'], ['membership-plans', planId]],
    successMessage: 'Membership plan updated successfully',
  });
};

export const useDeleteMembershipPlan = () => {
  return useApiMutation('/api/membership-plans', 'delete', {
    invalidateQueries: [['membership-plans']],
    successMessage: 'Membership plan deleted successfully',
  });
};

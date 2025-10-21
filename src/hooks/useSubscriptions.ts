import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export const useSubscriptions = (filters?: { 
  memberId?: string;
  planId?: string;
  status?: string;
}) => {
  const endpoint = buildEndpoint('/api/subscriptions', filters);
  return useApiQuery<any>(['subscriptions', filters?.memberId ?? 'all', filters?.planId ?? 'all', filters?.status ?? 'all'], endpoint);
};

export const useSubscriptionById = (subscriptionId: string) => {
  return useApiQuery(
    ['subscriptions', subscriptionId],
    `/api/subscriptions/${subscriptionId}`,
    { enabled: !!subscriptionId }
  );
};

export const useCreateSubscription = () => {
  return useApiMutation('/api/subscriptions', 'post', {
    invalidateQueries: [['subscriptions']],
    successMessage: 'Subscription created successfully',
  });
};

export const useCancelSubscription = (subscriptionId: string) => {
  return useApiMutation(`/api/subscriptions/${subscriptionId}/cancel`, 'post', {
    invalidateQueries: [['subscriptions'], ['subscriptions', subscriptionId]],
    successMessage: 'Subscription cancelled successfully',
  });
};

export const useRenewSubscription = (subscriptionId: string) => {
  return useApiMutation(`/api/subscriptions/${subscriptionId}/renew`, 'post', {
    invalidateQueries: [['subscriptions'], ['subscriptions', subscriptionId]],
    successMessage: 'Subscription renewed successfully',
  });
};

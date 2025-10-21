import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export const useTransactions = (filters?: { 
  memberId?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const endpoint = buildEndpoint('/api/transactions', filters);
  return useApiQuery<any>(['transactions', filters?.memberId ?? 'all', filters?.type ?? 'all', filters?.status ?? 'all', filters?.startDate ?? '', filters?.endDate ?? ''], endpoint);
};

export const useTransactionById = (transactionId: string) => {
  return useApiQuery(
    ['transactions', transactionId],
    `/api/transactions/${transactionId}`,
    { enabled: !!transactionId }
  );
};

export const useCreateTransaction = () => {
  return useApiMutation('/api/transactions', 'post', {
    invalidateQueries: [['transactions']],
    successMessage: 'Transaction recorded successfully',
  });
};

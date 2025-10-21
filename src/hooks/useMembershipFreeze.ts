import { useApiQuery, useApiMutation } from './useApiQuery';
import { RequestFreezeInput, UpdateFreezeRequestInput, FreezeQueryParams } from '@/types/freeze';

export const useFreezeRequests = (params?: FreezeQueryParams) => {
  return useApiQuery(
    ['freeze-requests', JSON.stringify(params)],
    `/api/membership-freeze${params ? '?' + new URLSearchParams(params as any).toString() : ''}`
  );
};

export const useFreezeRequest = (requestId: string) => {
  return useApiQuery(
    ['freeze-request', requestId],
    `/api/membership-freeze/${requestId}`,
    { enabled: !!requestId }
  );
};

export const useFreezeStats = (branchId?: string) => {
  return useApiQuery(
    ['freeze-stats', branchId || 'all'],
    `/api/membership-freeze/stats${branchId ? `?branch_id=${branchId}` : ''}`
  );
};

export const useRequestFreeze = () => {
  return useApiMutation<any, RequestFreezeInput>(
    '/api/membership-freeze',
    'post',
    {
      invalidateQueries: [['freeze-requests']],
      successMessage: 'Freeze request created successfully'
    }
  );
};

export const useUpdateFreezeRequest = (requestId: string) => {
  return useApiMutation<any, UpdateFreezeRequestInput>(
    `/api/membership-freeze/${requestId}`,
    'put',
    {
      invalidateQueries: [['freeze-requests'], ['freeze-request', requestId]],
      successMessage: 'Freeze request updated successfully'
    }
  );
};

export const useCancelFreezeRequest = (requestId: string) => {
  return useApiMutation<any, { member_id: string }>(
    `/api/membership-freeze/${requestId}`,
    'delete',
    {
      invalidateQueries: [['freeze-requests'], ['freeze-request', requestId]],
      successMessage: 'Freeze request cancelled successfully'
    }
  );
};

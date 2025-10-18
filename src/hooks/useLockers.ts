import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';
import { useBranchContext } from './useBranchContext';
import { Locker, LockerSummary } from '@/types/locker';

export const useLockers = (branchId?: string) => {
  const { currentBranchId } = useBranchContext();
  const targetBranchId = branchId || currentBranchId;
  
  const endpoint = buildEndpoint('/api/lockers', targetBranchId ? { branch_id: targetBranchId } : undefined);
  return useApiQuery<Locker[]>(
    ['lockers', targetBranchId || 'all'],
    endpoint,
    { enabled: !!targetBranchId }
  );
};

export const useLockerSummary = (branchId?: string) => {
  const { currentBranchId } = useBranchContext();
  const targetBranchId = branchId || currentBranchId;
  
  const endpoint = buildEndpoint('/api/lockers/summary', targetBranchId ? { branch_id: targetBranchId } : undefined);
  return useApiQuery<LockerSummary>(
    ['locker-summary', targetBranchId || 'all'],
    endpoint,
    { enabled: !!targetBranchId }
  );
};

export const useCreateLocker = () => {
  return useApiMutation(
    '/api/lockers',
    'post',
    {
      invalidateQueries: [['lockers'], ['locker-summary']],
      successMessage: 'Locker created successfully'
    }
  );
};

export const useBulkCreateLockers = () => {
  return useApiMutation(
    '/api/lockers/bulk',
    'post',
    {
      invalidateQueries: [['lockers'], ['locker-summary']],
      successMessage: 'Lockers created successfully'
    }
  );
};

export const useUpdateLocker = () => {
  return useApiMutation(
    '/api/lockers',
    'put',
    {
      invalidateQueries: [['lockers'], ['locker-summary']],
      successMessage: 'Locker updated successfully'
    }
  );
};

export const useDeleteLocker = () => {
  return useApiMutation(
    '/api/lockers',
    'delete',
    {
      invalidateQueries: [['lockers'], ['locker-summary']],
      successMessage: 'Locker deleted successfully'
    }
  );
};

export const useAssignLocker = () => {
  return useApiMutation(
    '/api/lockers/assign',
    'post',
    {
      invalidateQueries: [['lockers'], ['locker-summary']],
      successMessage: 'Locker assigned successfully'
    }
  );
};

export const useReleaseLocker = () => {
  return useApiMutation(
    '/api/lockers/release',
    'post',
    {
      invalidateQueries: [['lockers'], ['locker-summary']],
      successMessage: 'Locker released successfully'
    }
  );
};

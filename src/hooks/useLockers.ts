import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export const useLockers = (filters?: { 
  branchId?: string;
  status?: string;
  sizeId?: string;
}) => {
  const endpoint = buildEndpoint('/api/lockers', filters);
  return useApiQuery<any>(['lockers', filters?.branchId ?? 'all', filters?.status ?? 'all', filters?.sizeId ?? 'all'], endpoint);
};

export const useLockerById = (lockerId: string) => {
  return useApiQuery(
    ['lockers', lockerId],
    `/api/lockers/${lockerId}`,
    { enabled: !!lockerId }
  );
};

export const useLockerSizes = () => {
  return useApiQuery<any>(['locker-sizes'], '/api/lockers/sizes');
};

export const useLockerSummary = (branchId?: string) => {
  const endpoint = buildEndpoint('/api/lockers/summary', { branchId });
  return useApiQuery<any>(['locker-summary', branchId ?? 'all'], endpoint);
};

export const useCreateLocker = () => {
  return useApiMutation('/api/lockers', 'post', {
    invalidateQueries: [['lockers'], ['locker-summary']],
    successMessage: 'Locker created successfully',
  });
};

export const useBulkCreateLockers = () => {
  return useApiMutation('/api/lockers/bulk', 'post', {
    invalidateQueries: [['lockers'], ['locker-summary']],
    successMessage: 'Lockers created successfully',
  });
};

export const useUpdateLocker = () => {
  return useApiMutation('/api/lockers', 'put', {
    invalidateQueries: [['lockers'], ['locker-summary']],
    successMessage: 'Locker updated successfully',
  });
};

export const useAssignLocker = () => {
  return useApiMutation('/api/lockers/assign', 'post', {
    invalidateQueries: [['lockers'], ['locker-summary']],
    successMessage: 'Locker assigned successfully',
  });
};

export const useReleaseLocker = () => {
  return useApiMutation('/api/lockers/release', 'post', {
    invalidateQueries: [['lockers'], ['locker-summary']],
    successMessage: 'Locker released successfully',
  });
};

export const useDeleteLocker = () => {
  return useApiMutation('/api/lockers', 'delete', {
    invalidateQueries: [['lockers'], ['locker-summary']],
    successMessage: 'Locker deleted successfully',
  });
};

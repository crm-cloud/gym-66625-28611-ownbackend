import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export const useLockers = (filters?: { 
  branchId?: string;
  status?: string;
  sizeId?: string;
}) => {
  const endpoint = buildEndpoint('/api/lockers', filters);
  return useApiQuery<any>(['lockers', filters?.branchId ?? 'all', filters?.status ?? 'all', filters?.sizeId ?? 'all'], endpoint);
};

export const useLockerSizes = () => {
  return useApiQuery<any>(['locker-sizes'], '/api/lockers/sizes');
};

export const useBulkCreateLockers = () => {
  return useApiMutation('/api/lockers/bulk', 'post', {
    invalidateQueries: [['lockers']],
    successMessage: 'Lockers created successfully',
  });
};

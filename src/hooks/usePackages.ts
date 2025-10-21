import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export const usePackages = (filters?: { 
  trainerId?: string;
  type?: string;
  isActive?: boolean;
}) => {
  const endpoint = buildEndpoint('/api/packages', filters);
  return useApiQuery<any>(['packages', filters?.trainerId ?? 'all', filters?.type ?? 'all', String(filters?.isActive ?? 'all')], endpoint);
};

export const usePackageById = (packageId: string) => {
  return useApiQuery(
    ['packages', packageId],
    `/api/packages/${packageId}`,
    { enabled: !!packageId }
  );
};

export const useCreatePackage = () => {
  return useApiMutation('/api/packages', 'post', {
    invalidateQueries: [['packages']],
    successMessage: 'Package created successfully',
  });
};

export const useUpdatePackage = (packageId: string) => {
  return useApiMutation(`/api/packages/${packageId}`, 'put', {
    invalidateQueries: [['packages'], ['packages', packageId]],
    successMessage: 'Package updated successfully',
  });
};

export const useDeletePackage = () => {
  return useApiMutation('/api/packages', 'delete', {
    invalidateQueries: [['packages']],
    successMessage: 'Package deleted successfully',
  });
};

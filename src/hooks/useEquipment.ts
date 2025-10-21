import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export const useEquipment = (filters?: { 
  branchId?: string;
  status?: string;
  category?: string;
}) => {
  const endpoint = buildEndpoint('/api/equipment', filters);
  return useApiQuery<any>(['equipment', filters?.branchId ?? 'all', filters?.status ?? 'all', filters?.category ?? 'all'], endpoint);
};

export const useEquipmentById = (equipmentId: string) => {
  return useApiQuery(
    ['equipment', equipmentId],
    `/api/equipment/${equipmentId}`,
    { enabled: !!equipmentId }
  );
};

export const useCreateEquipment = () => {
  return useApiMutation('/api/equipment', 'post', {
    invalidateQueries: [['equipment']],
    successMessage: 'Equipment created successfully',
  });
};

export const useUpdateEquipment = (equipmentId: string) => {
  return useApiMutation(`/api/equipment/${equipmentId}`, 'put', {
    invalidateQueries: [['equipment'], ['equipment', equipmentId]],
    successMessage: 'Equipment updated successfully',
  });
};

export const useDeleteEquipment = () => {
  return useApiMutation('/api/equipment', 'delete', {
    invalidateQueries: [['equipment']],
    successMessage: 'Equipment deleted successfully',
  });
};

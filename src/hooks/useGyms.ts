import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export interface Gym {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  billing_email?: string;
  subscription_plan?: string;
  max_branches?: number;
  max_trainers?: number;
  max_members?: number;
  status: string;
  created_at: string;
  updated_at?: string;
}

interface GymStats {
  totalGyms: number;
  activeGyms: number;
  totalBranches: number;
  totalMembers: number;
}

export const useGyms = (params?: {
  page?: number;
  limit?: number;
  is_active?: boolean;
  search?: string;
}) => {
  const endpoint = buildEndpoint('/api/gyms', params);
  return useApiQuery<{ gyms: Gym[]; total: number; page: number; limit: number }>(
    ['gyms', JSON.stringify(params || {})],
    endpoint
  );
};

export const useGymById = (gymId: string) => {
  return useApiQuery<Gym>(
    ['gyms', gymId],
    `/api/gyms/${gymId}`,
    { enabled: !!gymId }
  );
};

export const useGymStats = () => {
  return useApiQuery<GymStats>(
    ['gyms', 'stats'],
    '/api/gyms/stats'
  );
};

export const useGymAnalytics = (gymId: string) => {
  return useApiQuery(
    ['gyms', gymId, 'analytics'],
    `/api/gyms/${gymId}/analytics`,
    { enabled: !!gymId }
  );
};

export const useCreateGym = () => {
  return useApiMutation('/api/gyms', 'post', {
    invalidateQueries: [['gyms'], ['gyms', 'stats']],
    successMessage: 'Gym created successfully',
  });
};

export const useUpdateGym = (gymId: string) => {
  return useApiMutation(`/api/gyms/${gymId}`, 'put', {
    invalidateQueries: [['gyms'], ['gyms', gymId], ['gyms', 'stats']],
    successMessage: 'Gym updated successfully',
  });
};

export const useDeleteGym = (gymId: string) => {
  return useApiMutation(`/api/gyms/${gymId}`, 'delete', {
    invalidateQueries: [['gyms'], ['gyms', 'stats']],
    successMessage: 'Gym deleted successfully',
  });
};

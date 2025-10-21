import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from '@/hooks/use-toast';

export const useTrainers = (filters?: { 
  branchId?: string; 
  specialties?: string[];
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['trainers', filters?.branchId ?? 'all', filters?.specialties ?? [], filters?.status ?? 'all', filters?.search ?? ''],
    queryFn: async () => {
      const params: any = {};
      
      if (filters?.branchId) {
        params.branch_id = filters.branchId;
      }
      if (filters?.specialties && filters.specialties.length > 0) {
        params.specialties = filters.specialties.join(',');
      }
      if (filters?.status) {
        params.status = filters.status;
      }
      if (filters?.search) {
        params.search = filters.search;
      }

      const response = await api.get('/api/trainers', { params });
      return response.data;
    },
  });
};

export const useTrainerById = (trainerId: string) => {
  return useQuery({
    queryKey: ['trainers', trainerId],
    queryFn: async () => {
      const response = await api.get(`/api/trainers/${trainerId}`);
      return response.data;
    },
    enabled: !!trainerId
  });
};

export const useTrainerStats = (trainerId: string) => {
  return useQuery({
    queryKey: ['trainer-stats', trainerId],
    queryFn: async () => {
      const response = await api.get(`/api/trainers/${trainerId}/stats`);
      return response.data;
    },
    enabled: !!trainerId
  });
};

export const useTrainerDashboard = (trainerId: string) => {
  return useQuery({
    queryKey: ['trainer-dashboard', trainerId],
    queryFn: async () => {
      const response = await api.get(`/api/trainers/${trainerId}/dashboard`);
      return response.data;
    },
    enabled: !!trainerId
  });
};

export const useTrainerAssignments = (trainerId: string) => {
  return useQuery({
    queryKey: ['trainer-assignments', trainerId],
    queryFn: async () => {
      const response = await api.get(`/api/assignments?trainerId=${trainerId}`);
      return response.data;
    },
    enabled: !!trainerId
  });
};

export const useTrainerClasses = (trainerId: string, date?: string) => {
  return useQuery({
    queryKey: ['trainer-classes', trainerId, date ?? 'today'],
    queryFn: async () => {
      const params: any = { trainerId };
      if (date) params.date = date;
      const response = await api.get('/api/classes', { params });
      return response.data;
    },
    enabled: !!trainerId
  });
};

export const useTrainerSchedule = (trainerId: string, date?: string) => {
  return useQuery({
    queryKey: ['trainer-schedule', trainerId, date ?? 'today'],
    queryFn: async () => {
      const params: any = {};
      if (date) {
        params.date = date;
      }
      const response = await api.get(`/api/trainers/${trainerId}/schedule`, { params });
      return response.data;
    },
    enabled: !!trainerId
  });
};

export const useCreateTrainer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trainerData: any) => {
      const response = await api.post('/api/trainers', trainerData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast({
        title: 'Success',
        description: 'Trainer created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create trainer',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateTrainer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trainerId, data }: { trainerId: string; data: any }) => {
      const response = await api.put(`/api/trainers/${trainerId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      queryClient.invalidateQueries({ queryKey: ['trainers', variables.trainerId] });
      queryClient.invalidateQueries({ queryKey: ['trainer-stats', variables.trainerId] });
      toast({
        title: 'Success',
        description: 'Trainer updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update trainer',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateTrainerAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trainerId, availability }: { trainerId: string; availability: any }) => {
      const response = await api.patch(`/api/trainers/${trainerId}/availability`, availability);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trainers', variables.trainerId] });
      queryClient.invalidateQueries({ queryKey: ['trainer-schedule', variables.trainerId] });
      toast({
        title: 'Success',
        description: 'Trainer availability updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update trainer availability',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteTrainer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trainerId: string) => {
      await api.delete(`/api/trainers/${trainerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast({
        title: 'Success',
        description: 'Trainer deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete trainer',
        variant: 'destructive',
      });
    },
  });
};

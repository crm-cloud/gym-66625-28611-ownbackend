import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { GymClass, ClassFormData, ClassFilters } from '@/types/class';

export const useGymClasses = (filters?: ClassFilters) => {
  return useQuery({
    queryKey: ['gym_classes', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.branchId) params.append('branch_id', filters.branchId);
      if (filters?.trainerId) params.append('trainer_id', filters.trainerId);
      if (filters?.tag) params.append('tag', filters.tag);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.date) params.append('date', filters.date.toISOString().split('T')[0]);

      const { data } = await api.get(`/api/classes?${params.toString()}`);
      return data.classes || [];
    }
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (classData: ClassFormData) => {
      const { data } = await api.post('/api/classes', {
        name: classData.name,
        description: classData.description,
        start_time: classData.startTime.toISOString(),
        end_time: classData.endTime.toISOString(),
        recurrence: classData.recurrence,
        trainer_id: classData.trainerId,
        branch_id: classData.branchId,
        capacity: classData.capacity,
        tags: classData.tags,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym_classes'] });
    }
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ClassFormData> }) => {
      const { data } = await api.patch(`/api/classes/${id}`, {
        name: updates.name,
        description: updates.description,
        start_time: updates.startTime?.toISOString(),
        end_time: updates.endTime?.toISOString(),
        recurrence: updates.recurrence,
        trainer_id: updates.trainerId,
        branch_id: updates.branchId,
        capacity: updates.capacity,
        tags: updates.tags,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym_classes'] });
    }
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/classes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym_classes'] });
    }
  });
};

export const useEnrollClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ classId, memberId }: { classId: string; memberId: string }) => {
      const { data } = await api.post('/api/enrollments', {
        class_id: classId,
        member_id: memberId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym_classes'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    }
  });
};

export const classTagLabels = {
  cardio: 'Cardio',
  strength: 'Strength Training',
  yoga: 'Yoga',
  pilates: 'Pilates',
  hiit: 'HIIT',
  boxing: 'Boxing',
  dance: 'Dance',
  aqua: 'Aqua Fitness',
  cycling: 'Cycling',
  crossfit: 'CrossFit'
};

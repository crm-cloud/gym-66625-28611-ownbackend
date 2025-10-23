import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Task, TaskStats, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@/types/task';

export const useTasks = (filters?: TaskFilters) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/tasks', { params: filters });
      return data;
    },
  });
};

export const useTaskById = (taskId: string) => {
  return useQuery<Task>({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/tasks/${taskId}`);
      return data;
    },
    enabled: !!taskId,
  });
};

export const useTaskStats = (filters?: Omit<TaskFilters, 'page' | 'limit'>) => {
  return useQuery<TaskStats>({
    queryKey: ['tasks', 'stats', filters],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/tasks/stats', { params: filters });
      return data;
    },
  });
};

export const useMyTasks = () => {
  return useQuery<Task[]>({
    queryKey: ['tasks', 'my-tasks'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/tasks/my-tasks');
      return data;
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Task, Error, CreateTaskInput>({
    mutationFn: async (input) => {
      const { data } = await api.post('/api/v1/tasks', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { id: string } & UpdateTaskInput>({
    mutationFn: async ({ id, ...input }) => {
      await api.put(`/api/v1/tasks/${id}`, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (taskId) => {
      await api.post(`/api/v1/tasks/${taskId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (taskId) => {
      await api.delete(`/api/v1/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

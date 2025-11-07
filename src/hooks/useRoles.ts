import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Role, Permission, UserRole, CreateRoleInput, UpdateRoleInput, AssignRoleInput, RoleFilters } from '@/types/role';

export const useRoles = (filters?: RoleFilters) => {
  return useQuery({
    queryKey: ['roles', filters],
    queryFn: async () => {
      const { data } = await api.get('/api/roles', { params: filters });
      return data;
    },
  });
};

export const useRoleById = (roleId: string) => {
  return useQuery<Role>({
    queryKey: ['roles', roleId],
    queryFn: async () => {
      const { data } = await api.get(`/api/roles/${roleId}`);
      return data;
    },
    enabled: !!roleId,
  });
};

export const usePermissions = () => {
  return useQuery<Permission[]>({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data } = await api.get('/api/roles/permissions');
      return data;
    },
  });
};

export const useUserRoles = (userId: string) => {
  return useQuery<UserRole[]>({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      const { data } = await api.get(`/api/roles/user/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Role, Error, CreateRoleInput>({
    mutationFn: async (input) => {
      const { data } = await api.post('/api/roles', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { id: string } & UpdateRoleInput>({
    mutationFn: async ({ id, ...input }) => {
      await api.put(`/api/roles/${id}`, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (roleId) => {
      await api.delete(`/api/roles/${roleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useAssignRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, AssignRoleInput>({
    mutationFn: async (input) => {
      await api.post('/api/roles/assign', input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-roles', variables.userId] });
    },
  });
};

export const useRemoveRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { userId: string; roleId: string }>({
    mutationFn: async ({ userId, roleId }) => {
      await api.delete(`/api/roles/assign`, { data: { userId, roleId } });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-roles', variables.userId] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from '@/hooks/use-toast';

export const useMembers = (filters?: { branchId?: string; search?: string; membershipStatus?: string }) => {
  return useQuery({
    queryKey: ['members', filters?.branchId ?? 'all', filters?.search ?? '', filters?.membershipStatus ?? 'all'],
    queryFn: async () => {
      const params: any = {};
      
      if (filters?.branchId) {
        params.branch_id = filters.branchId;
      }
      if (filters?.search) {
        params.search = filters.search;
      }
      if (filters?.membershipStatus) {
        params.status = filters.membershipStatus;
      }

      const response = await api.get('/api/members', { params });
      return response.data;
    },
  });
};

export const useMemberById = (memberId: string) => {
  return useQuery({
    queryKey: ['members', memberId],
    queryFn: async () => {
      const response = await api.get(`/api/members/${memberId}`);
      return response.data;
    },
    enabled: !!memberId
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberData: any) => {
      const response = await api.post('/api/members', memberData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: 'Success',
        description: 'Member created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create member',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, data }: { memberId: string; data: any }) => {
      const response = await api.put(`/api/members/${memberId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['members', variables.memberId] });
      toast({
        title: 'Success',
        description: 'Member updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update member',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      await api.delete(`/api/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: 'Success',
        description: 'Member deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete member',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Phase 5: Enable login capability for existing members
 */
export const enableMemberLogin = async (memberId: string, password: string) => {
  try {
    const response = await api.post(`/api/members/${memberId}/enable-login`, { password });
    
    toast({
      title: 'Success',
      description: 'Member login enabled successfully',
    });
    
    return response.data;
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.error || 'Failed to enable member login',
      variant: 'destructive',
    });
    throw error;
  }
};

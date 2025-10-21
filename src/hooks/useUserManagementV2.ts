import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserManagementService } from '@/services/api/UserManagementService';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for comprehensive user management operations
 * Separate from existing admin/staff creation hooks
 */
export const useUserManagementV2 = () => {
  const queryClient = useQueryClient();

  // Get all users
  const useUsers = (params?: {
    role?: string;
    branch_id?: string;
    is_active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    return useQuery({
      queryKey: ['users-v2', params],
      queryFn: () => UserManagementService.getUsers(params),
    });
  };

  // Get user by ID
  const useUser = (id: string) => {
    return useQuery({
      queryKey: ['user-v2', id],
      queryFn: () => UserManagementService.getUserById(id),
      enabled: !!id,
    });
  };

  // Get user stats
  const useUserStats = () => {
    return useQuery({
      queryKey: ['userStats-v2'],
      queryFn: () => UserManagementService.getUserStats(),
    });
  };

  // Create user
  const createUser = useMutation({
    mutationFn: UserManagementService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-v2'] });
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create user',
        variant: 'destructive',
      });
    },
  });

  // Update user
  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      UserManagementService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-v2'] });
      queryClient.invalidateQueries({ queryKey: ['user-v2'] });
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update user',
        variant: 'destructive',
      });
    },
  });

  // Delete user
  const deleteUser = useMutation({
    mutationFn: UserManagementService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-v2'] });
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete user',
        variant: 'destructive',
      });
    },
  });

  // Activate/Deactivate user
  const toggleUserStatus = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      UserManagementService.updateUser(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-v2'] });
      queryClient.invalidateQueries({ queryKey: ['user-v2'] });
      toast({
        title: 'Success',
        description: 'User status updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update user status',
        variant: 'destructive',
      });
    },
  });

  return {
    useUsers,
    useUser,
    useUserStats,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  };
};

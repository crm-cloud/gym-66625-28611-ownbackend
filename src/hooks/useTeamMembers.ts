import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';
import { useAuth } from '@/hooks/useAuth';
import { useBranchContext } from '@/hooks/useBranchContext';

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'staff' | 'trainer';
  branch_id?: string;
  gym_id?: string;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  branches?: {
    name: string;
  };
}

export interface CreateTeamMemberData {
  full_name: string;
  email: string;
  phone?: string;
  role: 'manager' | 'staff' | 'trainer';
  branch_id: string;
  password: string;
}

export const useTeamMembers = (params?: {
  branch_id?: string;
  role?: string;
  is_active?: boolean;
}) => {
  const { authState } = useAuth();
  const { currentBranchId } = useBranchContext();

  const queryParams = {
    ...params,
    gym_id: authState.user?.gym_id,
    ...(authState.user?.role !== 'super-admin' && authState.user?.role !== 'admin' && currentBranchId
      ? { branch_id: currentBranchId }
      : {}),
  };

  const endpoint = buildEndpoint('/api/team', queryParams);
  const query = useApiQuery<TeamMember[]>(
    ['team-members', JSON.stringify(queryParams)],
    endpoint,
    { enabled: !!authState.user?.gym_id }
  );

  const createMutation = useCreateTeamMember();
  const updateMutation = useUpdateTeamMember();
  const toggleMutation = useDeactivateTeamMember();
  const resetMutation = useRequestPasswordReset();

  return {
    teamMembers: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createTeamMember: createMutation.mutate,
    updateTeamMember: updateMutation.mutate,
    toggleMemberStatus: toggleMutation.mutate,
    resetPassword: resetMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isToggling: toggleMutation.isPending,
    isResetting: resetMutation.isPending
  };
};

export const useTeamMember = (userId: string) => {
  return useApiQuery<TeamMember>(['team-member', userId], `/api/team/${userId}`);
};

export const useCreateTeamMember = () => {
  return useApiMutation(
    '/api/team',
    'post',
    {
      invalidateQueries: [['team-members']],
      successMessage: 'Team member created successfully'
    }
  );
};

export const useUpdateTeamMember = () => {
  return useApiMutation(
    '/api/team',
    'put',
    {
      invalidateQueries: [['team-members'], ['team-member']],
      successMessage: 'Team member updated successfully'
    }
  );
};

export const useDeleteTeamMember = () => {
  return useApiMutation(
    '/api/team',
    'delete',
    {
      invalidateQueries: [['team-members']],
      successMessage: 'Team member removed successfully'
    }
  );
};

export const useDeactivateTeamMember = () => {
  return useApiMutation(
    '/api/team/deactivate',
    'post',
    {
      invalidateQueries: [['team-members'], ['team-member']],
      successMessage: 'Team member deactivated successfully'
    }
  );
};

export const useActivateTeamMember = () => {
  return useApiMutation(
    '/api/team/activate',
    'post',
    {
      invalidateQueries: [['team-members'], ['team-member']],
      successMessage: 'Team member activated successfully'
    }
  );
};

export const useRequestPasswordReset = () => {
  return useApiMutation(
    '/api/auth/request-password-reset',
    'post',
    {
      successMessage: 'Password reset email sent successfully'
    }
  );
};

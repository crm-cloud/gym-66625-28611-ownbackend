import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBranchContext } from '@/hooks/useBranchContext';
import { toast } from '@/hooks/use-toast';

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

export const useTeamMembers = () => {
  const { authState } = useAuth();
  const { currentBranchId } = useBranchContext();
  const queryClient = useQueryClient();

  // Get team members with branch filtering
  const {
    data: teamMembers = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['team-members', authState.user?.gym_id, currentBranchId],
    queryFn: async () => {
      if (!authState.user?.gym_id) return [];

      let query = supabase
        .from('profiles')
        .select(`
          *,
          branches!branch_id (
            name
          )
        `)
        .eq('gym_id', authState.user.gym_id)
        .in('role', ['manager', 'staff', 'trainer'])
        .order('created_at', { ascending: false });

      // Apply branch filtering for non-admin users
      if (authState.user.role !== 'super-admin' && authState.user.role !== 'admin' && currentBranchId) {
        query = query.eq('branch_id', currentBranchId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!authState.user?.gym_id,
  });

  // Create team member
  const createTeamMember = useMutation({
    mutationFn: async (memberData: CreateTeamMemberData) => {
      if (!authState.user?.gym_id) {
        throw new Error('Gym ID not found');
      }

      // Phase 2: Use unified service instead of auth.admin (security risk)
      const { createUserWithRole, generateTempPassword } = await import('@/services/userManagement');
      
      const tempPassword = generateTempPassword();
      
      // Create user with role using unified service
      const result = await createUserWithRole({
        email: memberData.email,
        password: tempPassword,
        full_name: memberData.full_name,
        phone: memberData.phone,
        role: memberData.role as any, // staff, manager, or trainer
        gym_id: authState.user.gym_id,
        branch_id: memberData.branch_id,
      });
      
      if (result.error) {
        throw result.error;
      }
      
      return result.user;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Team member created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create team member",
        variant: "destructive"
      });
    }
  });

  // Update team member
  const updateTeamMember = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TeamMember> & { id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          role: updates.role,
          branch_id: updates.branch_id,
          is_active: updates.is_active,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Team member updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update team member",
        variant: "destructive"
      });
    }
  });

  // Toggle team member status
  const toggleMemberStatus = useMutation({
    mutationFn: async (member: TeamMember) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          is_active: !member.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', member.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Team member ${data.is_active ? 'activated' : 'deactivated'} successfully`
      });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update team member status",
        variant: "destructive"
      });
    }
  });

  // Reset password
  const resetPassword = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password reset email sent successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email",
        variant: "destructive"
      });
    }
  });

  return {
    teamMembers,
    isLoading,
    error,
    refetch,
    createTeamMember: createTeamMember.mutate,
    updateTeamMember: updateTeamMember.mutate,
    toggleMemberStatus: toggleMemberStatus.mutate,
    resetPassword: resetPassword.mutate,
    isCreating: createTeamMember.isPending,
    isUpdating: updateTeamMember.isPending,
    isToggling: toggleMemberStatus.isPending,
    isResetting: resetPassword.isPending
  };
};
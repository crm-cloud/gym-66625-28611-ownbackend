import { useApiQuery, useApiMutation } from './useApiQuery';
import { 
  CreateTeamMemberInput, 
  UpdateTeamMemberInput, 
  CreateShiftInput, 
  TeamQueryParams, 
  ShiftsQueryParams 
} from '@/types/team';

// Team Members
export const useTeamMembers = (params?: TeamQueryParams) => {
  return useApiQuery(
    ['team-members', JSON.stringify(params)],
    `/api/team/members${params ? '?' + new URLSearchParams(params as any).toString() : ''}`
  );
};

export const useTeamMember = (memberId: string) => {
  return useApiQuery(
    ['team-member', memberId],
    `/api/team/members/${memberId}`,
    { enabled: !!memberId }
  );
};

export const useCreateTeamMember = () => {
  return useApiMutation<any, CreateTeamMemberInput>(
    '/api/team/members',
    'post',
    {
      invalidateQueries: [['team-members']],
      successMessage: 'Team member added successfully'
    }
  );
};

export const useUpdateTeamMember = (memberId: string) => {
  return useApiMutation<any, UpdateTeamMemberInput>(
    `/api/team/members/${memberId}`,
    'put',
    {
      invalidateQueries: [['team-members'], ['team-member', memberId]],
      successMessage: 'Team member updated successfully'
    }
  );
};

export const useDeleteTeamMember = (memberId: string) => {
  return useApiMutation(
    `/api/team/members/${memberId}`,
    'delete',
    {
      invalidateQueries: [['team-members'], ['team-member', memberId]],
      successMessage: 'Team member removed successfully'
    }
  );
};

// Work Shifts
export const useWorkShifts = (params?: ShiftsQueryParams) => {
  return useApiQuery(
    ['work-shifts', JSON.stringify(params)],
    `/api/team/shifts${params ? '?' + new URLSearchParams(params as any).toString() : ''}`
  );
};

export const useCreateShift = () => {
  return useApiMutation<any, CreateShiftInput>(
    '/api/team/shifts',
    'post',
    {
      invalidateQueries: [['work-shifts']],
      successMessage: 'Shift created successfully'
    }
  );
};

export const useUpdateShift = (shiftId: string) => {
  return useApiMutation<any, Partial<CreateShiftInput>>(
    `/api/team/shifts/${shiftId}`,
    'put',
    {
      invalidateQueries: [['work-shifts']],
      successMessage: 'Shift updated successfully'
    }
  );
};

export const useDeleteShift = (shiftId: string) => {
  return useApiMutation(
    `/api/team/shifts/${shiftId}`,
    'delete',
    {
      invalidateQueries: [['work-shifts']],
      successMessage: 'Shift deleted successfully'
    }
  );
};

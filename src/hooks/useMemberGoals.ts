import { useApiQuery, useApiMutation } from './useApiQuery';
import { CreateGoalInput, UpdateGoalInput, LogProgressInput, GoalsQueryParams } from '@/types/goals';

export const useMemberGoals = (params?: GoalsQueryParams) => {
  return useApiQuery(
    ['member-goals', JSON.stringify(params)],
    `/api/member-goals${params ? '?' + new URLSearchParams(params as any).toString() : ''}`
  );
};

export const useMemberGoal = (goalId: string) => {
  return useApiQuery(
    ['member-goal', goalId],
    `/api/member-goals/${goalId}`,
    { enabled: !!goalId }
  );
};

export const useGoalProgress = (goalId: string) => {
  return useApiQuery(
    ['goal-progress', goalId],
    `/api/member-goals/${goalId}/progress`,
    { enabled: !!goalId }
  );
};

export const useCreateGoal = () => {
  return useApiMutation<any, CreateGoalInput>(
    '/api/member-goals',
    'post',
    {
      invalidateQueries: [['member-goals']],
      successMessage: 'Goal created successfully'
    }
  );
};

export const useUpdateGoal = (goalId: string) => {
  return useApiMutation<any, UpdateGoalInput>(
    `/api/member-goals/${goalId}`,
    'put',
    {
      invalidateQueries: [['member-goals'], ['member-goal', goalId]],
      successMessage: 'Goal updated successfully'
    }
  );
};

export const useDeleteGoal = (goalId: string) => {
  return useApiMutation(
    `/api/member-goals/${goalId}`,
    'delete',
    {
      invalidateQueries: [['member-goals'], ['member-goal', goalId]],
      successMessage: 'Goal deleted successfully'
    }
  );
};

export const useLogProgress = (goalId: string) => {
  return useApiMutation<any, LogProgressInput>(
    `/api/member-goals/${goalId}/progress`,
    'post',
    {
      invalidateQueries: [['member-goal', goalId], ['goal-progress', goalId], ['member-goals']],
      successMessage: 'Progress logged successfully'
    }
  );
};

import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks?: number;
  equipment_needed?: string[];
  exercises?: any;
  created_by?: string;
  branch_id?: string;
  is_template: boolean;
  target_goals?: string[];
  status: string;
  workout_type?: string;
  sessions_per_week?: number;
  estimated_duration?: number;
  target_muscle_groups?: string[];
  created_by_name?: string;
  rating?: number;
  times_assigned?: number;
  created_at: string;
  updated_at: string;
}

export const useWorkoutPlans = (filters?: { branchId?: string; difficulty?: string; type?: string }) => {
  const endpoint = buildEndpoint('/api/workout-plans', filters);
  return useApiQuery<WorkoutPlan[]>(['workout-plans', JSON.stringify(filters || {})], endpoint);
};

export const useWorkoutPlan = (planId: string) => {
  return useApiQuery<WorkoutPlan>(['workout-plan', planId], `/api/workout-plans/${planId}`);
};

export const useMemberWorkoutPlans = (userId?: string) => {
  const endpoint = userId ? `/api/members/${userId}/workout-plans` : '/api/members/me/workout-plans';
  return useApiQuery(['member-workout-plans', userId || 'me'], endpoint);
};

export const useCreateWorkoutPlan = () => {
  return useApiMutation(
    '/api/workout-plans',
    'post',
    {
      invalidateQueries: [['workout-plans']],
      successMessage: 'Workout plan created successfully'
    }
  );
};

export const useUpdateWorkoutPlan = () => {
  return useApiMutation(
    '/api/workout-plans',
    'put',
    {
      invalidateQueries: [['workout-plans'], ['workout-plan']],
      successMessage: 'Workout plan updated successfully'
    }
  );
};

export const useDeleteWorkoutPlan = () => {
  return useApiMutation(
    '/api/workout-plans',
    'delete',
    {
      invalidateQueries: [['workout-plans']],
      successMessage: 'Workout plan deleted successfully'
    }
  );
};

export const useAssignWorkoutPlan = () => {
  return useApiMutation(
    '/api/workout-plans/assign',
    'post',
    {
      invalidateQueries: [['member-workout-plans'], ['workout-plans']],
      successMessage: 'Workout plan assigned successfully'
    }
  );
};

export const useCompleteWorkout = () => {
  return useApiMutation(
    '/api/workout-plans/complete',
    'post',
    {
      invalidateQueries: [['member-workout-plans']],
      successMessage: 'Workout marked as complete'
    }
  );
};

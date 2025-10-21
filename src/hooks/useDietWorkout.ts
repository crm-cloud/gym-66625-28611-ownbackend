import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export const useDietPlans = (filters?: { 
  memberId?: string;
}) => {
  const endpoint = buildEndpoint('/api/diet-workout/diet-plans', filters);
  return useApiQuery<any>(['diet-plans', filters?.memberId ?? 'all'], endpoint);
};

export const useWorkoutPlans = (filters?: { 
  memberId?: string;
}) => {
  const endpoint = buildEndpoint('/api/diet-workout/workout-plans', filters);
  return useApiQuery<any>(['workout-plans', filters?.memberId ?? 'all'], endpoint);
};

export const useCreateDietPlan = () => {
  return useApiMutation('/api/diet-workout/diet-plans', 'post', {
    invalidateQueries: [['diet-plans']],
    successMessage: 'Diet plan created successfully',
  });
};

export const useCreateWorkoutPlan = () => {
  return useApiMutation('/api/diet-workout/workout-plans', 'post', {
    invalidateQueries: [['workout-plans']],
    successMessage: 'Workout plan created successfully',
  });
};

import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type WorkoutPlanRow = Database['public']['Tables']['workout_plans']['Row'];
type WorkoutPlanInsert = Database['public']['Tables']['workout_plans']['Insert'];

export interface WorkoutPlan extends WorkoutPlanRow {
  // Additional computed fields
  workout_type?: string;
  sessions_per_week?: number;
  estimated_duration?: number;
  target_muscle_groups?: string[];
  created_by_name?: string;
  rating?: number;
  times_assigned?: number;
}

export const useWorkoutPlans = (filters?: { branchId?: string; difficulty?: string; type?: string }) => {
  return useSupabaseQuery(
    ['workout_plans', filters?.branchId ?? 'all', filters?.difficulty ?? 'all', filters?.type ?? 'all'],
    async () => {
      let query = supabase
        .from('workout_plans')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filters?.branchId) {
        query = query.eq('branch_id', filters.branchId);
      }

      if (filters?.difficulty && filters.difficulty !== 'all') {
        query = query.eq('difficulty', filters.difficulty as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Map to include computed fields
      return (data || []).map(plan => ({
        ...plan,
        workout_type: 'mixed', // Default value
        sessions_per_week: 3,
        estimated_duration: 45,
        target_muscle_groups: plan.target_goals || [],
        created_by_name: 'System',
        rating: 4.5,
        times_assigned: 0
      })) as WorkoutPlan[];
    }
  );
};

export const useMemberWorkoutPlans = (userId?: string) => {
  return useSupabaseQuery(
    ['member_workout_plans', userId || 'current'],
    async () => {
      const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      
      const { data, error } = await supabase
        .from('member_workout_plans')
        .select(`
          *,
          workout_plans (*)
        `)
        .eq('user_id', currentUserId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    {
      enabled: true
    }
  );
};

export const useCreateWorkoutPlan = () => {
  return useSupabaseMutation(
    async (planData: Partial<WorkoutPlanInsert> & { name: string; difficulty: any }) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('workout_plans')
        .insert([{
          name: planData.name,
          description: planData.description,
          difficulty: planData.difficulty,
          duration_weeks: planData.duration_weeks || 4,
          equipment_needed: planData.equipment_needed,
          exercises: planData.exercises,
          created_by: userData.user?.id,
          branch_id: planData.branch_id,
          is_template: planData.is_template || false,
          target_goals: planData.target_goals || [],
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['workout_plans']],
      onSuccess: () => {
        // Success handled by mutation hook
      }
    }
  );
};

export const useAssignWorkoutPlan = () => {
  return useSupabaseMutation(
    async ({ userId, planId, startDate, endDate, notes }: {
      userId: string;
      planId: string;
      startDate?: string;
      endDate?: string;
      notes?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('member_workout_plans')
        .insert([{
          user_id: userId,
          workout_plan_id: planId,
          assigned_by: userData.user?.id,
          start_date: startDate,
          end_date: endDate,
          notes
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['member_workout_plans'], ['workout_plans']],
      onSuccess: () => {
        // Success handled by mutation hook
      }
    }
  );
};

import { useSupabaseQuery } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

export const useTrainerClients = (trainerId?: string) => {
  return useSupabaseQuery(
    ['trainer-clients', trainerId],
    async () => {
      const { data, error } = await supabase
        .from('trainer_assignments')
        .select(`
          *,
          members (
            id,
            full_name,
            email,
            user_id,
            member_goals (title, current_value, target_value),
            member_measurements (measured_date, weight)
          )
        `)
        .eq('trainer_id', trainerId)
        .in('status', ['scheduled', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    { enabled: !!trainerId }
  );
};

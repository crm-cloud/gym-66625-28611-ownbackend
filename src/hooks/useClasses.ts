import { useSupabaseQuery } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

export const useGymClasses = () => {
  return useSupabaseQuery(
    ['gym_classes'],
    async () => {
      const { data, error } = await supabase
        .from('gym_classes')
        .select(`
          *,
          branches!branch_id (
            name
          ),
          trainer_profiles!trainer_id (
            name
          )
        `)
        .eq('status', 'scheduled')
        .gte('start_time', new Date().toISOString())
        .order('start_time');

      if (error) throw error;
      return data || [];
    }
  );
};

export const classTagLabels = {
  cardio: 'Cardio',
  strength: 'Strength Training',
  yoga: 'Yoga',
  pilates: 'Pilates',
  hiit: 'HIIT',
  boxing: 'Boxing',
  dance: 'Dance',
  aqua: 'Aqua Fitness',
  cycling: 'Cycling',
  crossfit: 'CrossFit'
};
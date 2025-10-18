import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

interface CreateTrainerData {
  full_name: string;
  email: string;
  phone: string;
  branch_id: string;
  role: 'trainer';
  specialties?: string[];
  is_active?: boolean;
  profile_photo?: string;
}

export const useTrainers = () => {
  return useSupabaseQuery(
    ['trainers'],
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          branches!branch_id (
            name
          )
        `)
        .eq('role', 'trainer')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      return data || [];
    }
  );
};

export const useTrainerById = (trainerId: string) => {
  return useSupabaseQuery(
    ['trainers', trainerId],
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          branches!branch_id (
            name
          )
        `)
        .eq('user_id', trainerId)
        .eq('role', 'trainer')
        .single();

      if (error) throw error;
      return data;
    },
    {
      enabled: !!trainerId
    }
  );
};

export const useCreateTrainer = () => {
  return useSupabaseMutation(
    async (data: CreateTrainerData) => {
      // Call the secure edge function to create trainer account
      const { data: result, error } = await supabase.functions.invoke('create-trainer-account', {
        body: {
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          branch_id: data.branch_id,
          specialties: data.specialties,
          is_active: data.is_active ?? true,
          profile_photo: data.profile_photo
        }
      });

      if (error) throw error;
      if (!result.success) throw new Error(result.error || 'Failed to create trainer');

      return result.userId;
    },
    {
      onSuccess: () => {
        // Invalidate trainer queries to refetch
      },
      invalidateQueries: [['trainers']]
    }
  );
};
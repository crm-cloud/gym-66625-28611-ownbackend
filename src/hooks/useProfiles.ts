import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

export const useProfiles = () => {
  return useSupabaseQuery(
    ['profiles'],
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          branches!branch_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  );
};

export const useProfile = (userId: string) => {
  return useSupabaseQuery(
    ['profiles', userId],
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          branches!branch_id (
            name
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    {
      enabled: !!userId
    }
  );
};

export const useUpdateProfile = () => {
  return useSupabaseMutation(
    async ({ userId, updates }: { userId: string; updates: any }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['profiles']],
      onSuccess: () => {
        // Profile update success is handled by the toast in the mutation hook
      }
    }
  );
};

export const useCreateProfile = () => {
  return useSupabaseMutation(
    async (profileData: any) => {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['profiles']],
      onSuccess: () => {
        // Profile creation success is handled by the toast in the mutation hook
      }
    }
  );
};
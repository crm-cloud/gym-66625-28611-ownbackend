import { useSupabaseQuery } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useMemberProfile = () => {
  const { authState } = useAuth();
  
  return useSupabaseQuery(
    ['member-profile', authState.user?.id],
    async () => {
      if (!authState.user?.id) {
        console.error('[useMemberProfile] Not authenticated');
        throw new Error('Not authenticated');
      }
      
      console.log('[useMemberProfile] Fetching for user:', authState.user.id);
      
      const { data, error } = await supabase
        .from('members')
        .select('*, branches(name)')
        .eq('user_id', authState.user.id)
        .maybeSingle();
      
      if (error) {
        console.error('[useMemberProfile] Query error:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('[useMemberProfile] No member record found for user:', authState.user.id);
        return null;
      }
      
      console.log('[useMemberProfile] Member data:', data);
      return data;
    },
    {
      enabled: !!authState.user?.id && authState.user?.role === 'member'
    }
  );
};

import { useSupabaseQuery } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

export const useMembers = (filters?: { branchId?: string; search?: string; membershipStatus?: string }) => {
  return useSupabaseQuery(
    ['members', filters?.branchId ?? 'all'],
    async () => {
      let query = supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.branchId) {
        query = query.eq('branch_id', filters.branchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  );
};

export const useMemberById = (memberId: string) => {
  return useSupabaseQuery(
    ['members', memberId],
    async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error) throw error;
      return data;
    },
    {
      enabled: !!memberId
    }
  );
};

/**
 * Phase 5: Enable login capability for existing members
 * Re-exports the service function for convenience
 */
export { enableMemberLogin } from '@/services/userManagement';
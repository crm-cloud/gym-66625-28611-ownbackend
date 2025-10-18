import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuth } from './useAuth';

export const useMemberProfile = () => {
  const { authState } = useAuth();
  
  return useQuery({
    queryKey: ['member-profile', authState.user?.id],
    queryFn: async () => {
      if (!authState.user?.id) {
        console.error('[useMemberProfile] Not authenticated');
        throw new Error('Not authenticated');
      }
      
      console.log('[useMemberProfile] Fetching for user:', authState.user.id);
      
      try {
        // Get member profile by user_id
        const response = await api.get('/api/members', {
          params: { user_id: authState.user.id }
        });

        // Backend returns array, get first member
        const members = response.data;
        const memberData = Array.isArray(members) ? members[0] : members;
        
        if (!memberData) {
          console.warn('[useMemberProfile] No member record found for user:', authState.user.id);
          return null;
        }
        
        console.log('[useMemberProfile] Member data:', memberData);
        
        // Transform to expected format
        return {
          ...memberData,
          branches: memberData.branch_name ? { name: memberData.branch_name } : null
        };
      } catch (error: any) {
        console.error('[useMemberProfile] Query error:', error);
        throw error;
      }
    },
    enabled: !!authState.user?.id && authState.user?.role === 'member',
    retry: 1
  });
};

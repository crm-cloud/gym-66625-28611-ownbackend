import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const useTrainerClients = (trainerId?: string) => {
  return useQuery({
    queryKey: ['trainer-clients', trainerId],
    queryFn: async () => {
      if (!trainerId) {
        throw new Error('Trainer ID is required');
      }

      // Get trainer assignments (sessions) for this trainer
      const response = await api.get(`/api/assignments/trainer/${trainerId}`, {
        params: {
          status: 'scheduled,in_progress' // Active sessions only
        }
      });

      // Transform assignments to include member data
      const assignments = response.data;
      
      // Group by member to avoid duplicates
      const clientsMap = new Map();
      
      for (const assignment of assignments) {
        if (assignment.member_id && !clientsMap.has(assignment.member_id)) {
          clientsMap.set(assignment.member_id, {
            id: assignment.member_id,
            members: {
              id: assignment.member_id,
              full_name: assignment.member_name || 'Unknown',
              email: assignment.member_email,
              user_id: assignment.member_user_id,
              // Add goals and measurements if available
              member_goals: assignment.member_goals || [],
              member_measurements: assignment.member_measurements || []
            }
          });
        }
      }

      return Array.from(clientsMap.values());
    },
    enabled: !!trainerId
  });
};

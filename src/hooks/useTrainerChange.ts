import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrainerChangeService } from '@/services/api/TrainerChangeService';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for managing trainer change requests
 */
export const useTrainerChange = () => {
  const queryClient = useQueryClient();

  // Get change requests
  const useChangeRequests = (params?: {
    member_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    return useQuery({
      queryKey: ['trainerChangeRequests', params],
      queryFn: () => TrainerChangeService.getChangeRequests(params),
    });
  };

  // Get change request by ID
  const useChangeRequest = (id: string) => {
    return useQuery({
      queryKey: ['trainerChangeRequest', id],
      queryFn: () => TrainerChangeService.getChangeRequestById(id),
      enabled: !!id,
    });
  };

  // Get change request stats
  const useChangeRequestStats = () => {
    return useQuery({
      queryKey: ['trainerChangeRequestStats'],
      queryFn: () => TrainerChangeService.getChangeRequestStats(),
    });
  };

  // Create change request
  const createChangeRequest = useMutation({
    mutationFn: TrainerChangeService.createChangeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerChangeRequests'] });
      toast({
        title: 'Success',
        description: 'Trainer change request submitted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to submit change request',
        variant: 'destructive',
      });
    },
  });

  // Review change request
  const reviewChangeRequest = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      TrainerChangeService.reviewChangeRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerChangeRequests'] });
      queryClient.invalidateQueries({ queryKey: ['trainerChangeRequest'] });
      toast({
        title: 'Success',
        description: 'Change request reviewed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to review change request',
        variant: 'destructive',
      });
    },
  });

  return {
    useChangeRequests,
    useChangeRequest,
    useChangeRequestStats,
    createChangeRequest,
    reviewChangeRequest,
  };
};

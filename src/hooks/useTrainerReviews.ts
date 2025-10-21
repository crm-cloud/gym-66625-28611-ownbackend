import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrainerReviewService } from '@/services/api/TrainerReviewService';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for managing trainer reviews
 */
export const useTrainerReviews = () => {
  const queryClient = useQueryClient();

  // Get reviews
  const useReviews = (params?: {
    trainer_id?: string;
    member_id?: string;
    rating?: number;
    is_verified?: boolean;
    is_featured?: boolean;
    page?: number;
    limit?: number;
  }) => {
    return useQuery({
      queryKey: ['trainerReviews', params],
      queryFn: () => TrainerReviewService.getReviews(params),
    });
  };

  // Get review by ID
  const useReview = (id: string) => {
    return useQuery({
      queryKey: ['trainerReview', id],
      queryFn: () => TrainerReviewService.getReviewById(id),
      enabled: !!id,
    });
  };

  // Get trainer review summary
  const useTrainerReviewSummary = (trainerId: string) => {
    return useQuery({
      queryKey: ['trainerReviewSummary', trainerId],
      queryFn: () => TrainerReviewService.getTrainerReviewSummary(trainerId),
      enabled: !!trainerId,
    });
  };

  // Create review
  const createReview = useMutation({
    mutationFn: TrainerReviewService.createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerReviews'] });
      toast({
        title: 'Success',
        description: 'Review submitted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to submit review',
        variant: 'destructive',
      });
    },
  });

  // Update review
  const updateReview = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      TrainerReviewService.updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerReviews'] });
      queryClient.invalidateQueries({ queryKey: ['trainerReview'] });
      toast({
        title: 'Success',
        description: 'Review updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update review',
        variant: 'destructive',
      });
    },
  });

  // Delete review
  const deleteReview = useMutation({
    mutationFn: TrainerReviewService.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerReviews'] });
      toast({
        title: 'Success',
        description: 'Review deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete review',
        variant: 'destructive',
      });
    },
  });

  return {
    useReviews,
    useReview,
    useTrainerReviewSummary,
    createReview,
    updateReview,
    deleteReview,
  };
};

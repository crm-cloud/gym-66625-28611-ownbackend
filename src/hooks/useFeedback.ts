import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export const useFeedback = (filters?: { 
  memberId?: string;
  category?: string;
  status?: string;
}) => {
  const endpoint = buildEndpoint('/api/feedback', filters);
  return useApiQuery<any>(['feedback', filters?.memberId ?? 'all', filters?.category ?? 'all', filters?.status ?? 'all'], endpoint);
};

export const useFeedbackById = (feedbackId: string) => {
  return useApiQuery(
    ['feedback', feedbackId],
    `/api/feedback/${feedbackId}`,
    { enabled: !!feedbackId }
  );
};

export const useCreateFeedback = () => {
  return useApiMutation('/api/feedback', 'post', {
    invalidateQueries: [['feedback']],
    successMessage: 'Feedback submitted successfully',
  });
};

export const useUpdateFeedbackStatus = (feedbackId: string) => {
  return useApiMutation(`/api/feedback/${feedbackId}/status`, 'put', {
    invalidateQueries: [['feedback'], ['feedback', feedbackId]],
    successMessage: 'Feedback status updated',
  });
};

import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export const useAssignments = (filters?: { 
  trainerId?: string;
  memberId?: string;
  status?: string;
}) => {
  const endpoint = buildEndpoint('/api/assignments', filters);
  return useApiQuery<any>(['assignments', filters?.trainerId ?? 'all', filters?.memberId ?? 'all', filters?.status ?? 'all'], endpoint);
};

export const useAssignmentById = (assignmentId: string) => {
  return useApiQuery(
    ['assignments', assignmentId],
    `/api/assignments/${assignmentId}`,
    { enabled: !!assignmentId }
  );
};

export const useCreateAssignment = () => {
  return useApiMutation('/api/assignments', 'post', {
    invalidateQueries: [['assignments']],
    successMessage: 'Assignment created successfully',
  });
};

export const useUpdateAssignment = (assignmentId: string) => {
  return useApiMutation(`/api/assignments/${assignmentId}`, 'put', {
    invalidateQueries: [['assignments'], ['assignments', assignmentId]],
    successMessage: 'Assignment updated successfully',
  });
};

export const useDeleteAssignment = () => {
  return useApiMutation('/api/assignments', 'delete', {
    invalidateQueries: [['assignments']],
    successMessage: 'Assignment deleted successfully',
  });
};

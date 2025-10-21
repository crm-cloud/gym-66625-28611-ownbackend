import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export const useEnrollments = (filters?: { 
  memberId?: string;
  classId?: string;
  status?: string;
}) => {
  const endpoint = buildEndpoint('/api/enrollments', filters);
  return useApiQuery<any>(['enrollments', filters?.memberId ?? 'all', filters?.classId ?? 'all', filters?.status ?? 'all'], endpoint);
};

export const useEnrollmentById = (enrollmentId: string) => {
  return useApiQuery(
    ['enrollments', enrollmentId],
    `/api/enrollments/${enrollmentId}`,
    { enabled: !!enrollmentId }
  );
};

export const useCreateEnrollment = () => {
  return useApiMutation('/api/enrollments', 'post', {
    invalidateQueries: [['enrollments']],
    successMessage: 'Enrollment created successfully',
  });
};

export const useCancelEnrollment = (enrollmentId: string) => {
  return useApiMutation(`/api/enrollments/${enrollmentId}/cancel`, 'post', {
    invalidateQueries: [['enrollments'], ['enrollments', enrollmentId]],
    successMessage: 'Enrollment cancelled successfully',
  });
};

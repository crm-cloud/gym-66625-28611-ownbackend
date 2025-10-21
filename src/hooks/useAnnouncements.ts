import { useApiQuery, useApiMutation, buildEndpoint } from './useApiQuery';

export const useAnnouncements = (filters?: { 
  branchId?: string;
  type?: string;
  isActive?: boolean;
}) => {
  const endpoint = buildEndpoint('/api/announcements', filters);
  return useApiQuery<any>(['announcements', filters?.branchId ?? 'all', filters?.type ?? 'all', String(filters?.isActive ?? 'all')], endpoint);
};

export const useAnnouncementById = (announcementId: string) => {
  return useApiQuery(
    ['announcements', announcementId],
    `/api/announcements/${announcementId}`,
    { enabled: !!announcementId }
  );
};

export const useCreateAnnouncement = () => {
  return useApiMutation('/api/announcements', 'post', {
    invalidateQueries: [['announcements']],
    successMessage: 'Announcement created successfully',
  });
};

export const useUpdateAnnouncement = (announcementId: string) => {
  return useApiMutation(`/api/announcements/${announcementId}`, 'put', {
    invalidateQueries: [['announcements'], ['announcements', announcementId]],
    successMessage: 'Announcement updated successfully',
  });
};

export const useDeleteAnnouncement = () => {
  return useApiMutation('/api/announcements', 'delete', {
    invalidateQueries: [['announcements']],
    successMessage: 'Announcement deleted successfully',
  });
};

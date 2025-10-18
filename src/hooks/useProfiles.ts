import { useApiQuery, useApiMutation } from './useApiQuery';

export const useProfiles = () => {
  return useApiQuery(['profiles'], '/api/profiles');
};

export const useProfile = (userId?: string) => {
  return useApiQuery(
    ['profile', userId || 'me'],
    userId ? `/api/profiles/${userId}` : '/api/users/me',
    { enabled: !!userId || userId === undefined }
  );
};

export const useUpdateProfile = () => {
  return useApiMutation(
    '/api/users/me',
    'put',
    {
      invalidateQueries: [['profile', 'me'], ['profiles']],
      successMessage: 'Profile updated successfully'
    }
  );
};

export const useCreateProfile = () => {
  return useApiMutation(
    '/api/profiles',
    'post',
    {
      invalidateQueries: [['profiles']],
      successMessage: 'Profile created successfully'
    }
  );
};

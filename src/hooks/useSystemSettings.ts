import { useApiQuery, useApiMutation } from './useApiQuery';

export interface SystemSetting {
  id: string;
  category: 'general' | 'security' | 'database' | 'notifications' | 'backup' | 'subscription';
  key: string;
  value: any;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useSystemSettings = (category?: string) => {
  const endpoint = category ? `/api/settings?category=${category}` : '/api/settings';
  return useApiQuery<SystemSetting[]>(['system-settings', category], endpoint);
};

export const useSystemSetting = (category: string, key: string) => {
  const { data: settings } = useSystemSettings(category);
  const setting = settings?.find(s => s.key === key);
  return setting?.value;
};

export const useUpdateSystemSetting = () => {
  return useApiMutation(
    '/api/settings',
    'put',
    {
      invalidateQueries: [['system-settings']],
      successMessage: 'Setting updated successfully'
    }
  );
};

export const useBulkUpdateSettings = () => {
  return useApiMutation(
    '/api/settings/bulk',
    'put',
    {
      invalidateQueries: [['system-settings']],
      successMessage: 'Settings updated successfully'
    }
  );
};

export const useCreateSystemSetting = () => {
  return useApiMutation(
    '/api/settings',
    'post',
    {
      invalidateQueries: [['system-settings']],
      successMessage: 'Setting created successfully'
    }
  );
};

export const useResetSettings = () => {
  return useApiMutation(
    '/api/settings/reset',
    'post',
    {
      invalidateQueries: [['system-settings']],
      successMessage: 'Settings reset to defaults'
    }
  );
};

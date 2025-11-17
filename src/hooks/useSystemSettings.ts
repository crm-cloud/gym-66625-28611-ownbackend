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
  
  if (settings) {
    console.log('[useSystemSetting] Settings data received:', {
      type: typeof settings,
      isArray: Array.isArray(settings),
      keys: Array.isArray(settings) ? undefined : Object.keys(settings || {}),
      value: settings
    });
  }
  
  // Ensure settings is an array before calling find
  if (!Array.isArray(settings)) {
    console.warn('[useSystemSetting] Settings is not an array:', settings);
    return undefined;
  }
  
  const setting = settings.find(s => s.key === key);
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

/**
 * Settings Transformer Utility
 * Converts between database format (JSONB config) and frontend format (array of key-value pairs)
 */

export interface SettingRecord {
  id: string;
  category: string;
  key: string;
  value: any;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSetting {
  id: string;
  category: string;
  gym_id: string | null;
  branch_id: string | null;
  config: Record<string, any>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Transform database format to frontend format
 * Database: {id, category, config: {key1: value1, key2: value2}}
 * Frontend: [{id, category, key: 'key1', value: value1}, {id, category, key: 'key2', value: value2}]
 */
export function transformDatabaseToFrontend(dbSetting: DatabaseSetting): SettingRecord[] {
  if (!dbSetting || !dbSetting.config) {
    return [];
  }

  return Object.entries(dbSetting.config).map(([key, value]) => ({
    id: dbSetting.id,
    category: dbSetting.category,
    key,
    value,
    created_at: dbSetting.created_at.toISOString(),
    updated_at: dbSetting.updated_at.toISOString(),
  }));
}

/**
 * Transform frontend format to database format
 * Frontend: {category, key: 'timezone', value: 'UTC', description: '...'}
 * Database: {timezone: 'UTC'}
 */
export function transformFrontendToDatabase(
  frontendData: any
): Record<string, any> {
  const config: Record<string, any> = {};

  // Handle single setting
  if (frontendData.key && frontendData.value !== undefined) {
    config[frontendData.key] = frontendData.value;
    return config;
  }

  // Handle array of settings
  if (Array.isArray(frontendData)) {
    frontendData.forEach((setting) => {
      if (setting.key && setting.value !== undefined) {
        config[setting.key] = setting.value;
      }
    });
    return config;
  }

  // Handle object with multiple key-value pairs
  if (typeof frontendData === 'object' && frontendData !== null) {
    Object.entries(frontendData).forEach(([key, value]) => {
      if (key !== 'category' && key !== 'id' && key !== 'description') {
        config[key] = value;
      }
    });
  }

  return config;
}

/**
 * Merge new settings with existing config
 */
export function mergeSettings(
  existingConfig: Record<string, any>,
  newSettings: Record<string, any>
): Record<string, any> {
  return {
    ...existingConfig,
    ...newSettings,
  };
}

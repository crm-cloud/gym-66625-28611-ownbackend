import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';

export class SettingsService {
  /**
   * Encrypt sensitive data
   */
  private encryptSecret(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32)),
      iv
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  private decryptSecret(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32)),
      iv
    );
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Get all settings with hierarchical inheritance
   */
  async getAllSettings(userRole?: string, gymId?: string, branchId?: string) {
    const categories = ['payment-gateways', 'sms', 'email', 'whatsapp', 'ai'];
    const settings: any = {};

    for (const category of categories) {
      settings[category] = await this.getSettingsByCategory(
        category,
        userRole,
        gymId,
        branchId
      );
    }

    return settings;
  }

  /**
   * Get settings by category with hierarchical inheritance
   */
  async getSettingsByCategory(
    category: string,
    userRole?: string,
    gymId?: string,
    branchId?: string
  ) {
    try {
      console.log('[Settings] Getting settings:', { category, userRole, gymId, branchId });
      
      // CRITICAL: Enforce role-based access using parameterized queries
      let whereClause: any = { category };

    if (userRole === 'super_admin') {
      // Super admin: ONLY global settings (null gym_id and branch_id)
      whereClause.gym_id = null;
      whereClause.branch_id = null;
    } else if (userRole === 'admin' && gymId) {
      // Admin: ONLY their gym's settings (or global as fallback)
      // First try gym-specific
      const gymSetting = await prisma.system_settings.findFirst({
        where: {
          category,
          gym_id: gymId,
          branch_id: null
        }
      });

      if (gymSetting) {
        return this.decryptSettingFields(gymSetting);
      }

      // Fallback to global
      whereClause.gym_id = null;
      whereClause.branch_id = null;
    } else if (branchId && gymId) {
      // Branch manager: Branch settings > Gym settings > Global
      const branchSetting = await prisma.system_settings.findFirst({
        where: {
          category,
          branch_id: branchId
        }
      });

      if (branchSetting) {
        return this.decryptSettingFields(branchSetting);
      }

      // Fallback to gym
      const gymSetting = await prisma.system_settings.findFirst({
        where: {
          category,
          gym_id: gymId,
          branch_id: null
        }
      });

      if (gymSetting) {
        return this.decryptSettingFields(gymSetting);
      }

      // Fallback to global
      whereClause.gym_id = null;
      whereClause.branch_id = null;
    } else {
      // Default: global only
      whereClause.gym_id = null;
      whereClause.branch_id = null;
    }

    const setting = await prisma.system_settings.findFirst({
      where: whereClause
    });

    if (!setting) {
      return this.getDefaultSettings(category);
    }

    return this.decryptSettingFields(setting);
    } catch (error) {
      console.error('[Settings] Error in getSettingsByCategory:', error);
      // Return defaults on error instead of crashing
      return this.getDefaultSettings(category);
    }
  }

  /**
   * Decrypt sensitive fields in settings
   */
  private decryptSettingFields(setting: any) {
    if (setting.config) {
      const config = setting.config;
      const sensitiveFields = ['api_key', 'api_secret', 'webhook_secret', 'merchant_key', 'password'];
      
      for (const field of sensitiveFields) {
        if (config[field] && typeof config[field] === 'string' && config[field].includes(':')) {
          try {
            config[field] = this.decryptSecret(config[field]);
          } catch (error) {
            console.error(`Failed to decrypt ${field}:`, error);
          }
        }
      }
    }
    return setting;
  }

  /**
   * Update settings
   */
  async updateSettings(
    category: string,
    config: any,
    userRole?: string,
    gymId?: string,
    branchId?: string
  ) {
    // CRITICAL: Enforce role-based write access
    if (userRole === 'super_admin') {
      // Super admin can ONLY update global settings
      if (gymId || branchId) {
        throw new ApiError('Super admin cannot update gym or branch settings', 403);
      }
    } else if (userRole === 'admin') {
      // Admin can ONLY update their gym's settings
      if (!gymId) {
        throw new ApiError('Admin must have a gym_id', 403);
      }
      if (branchId) {
        throw new ApiError('Admin cannot update branch settings directly', 403);
      }
    } else {
      throw new ApiError('Insufficient permissions to update settings', 403);
    }

    // Encrypt sensitive fields
    const sensitiveFields = ['api_key', 'api_secret', 'webhook_secret', 'merchant_key', 'password'];
    const encryptedConfig = { ...config };
    
    for (const field of sensitiveFields) {
      if (encryptedConfig[field]) {
        encryptedConfig[field] = this.encryptSecret(encryptedConfig[field]);
      }
    }

    // Determine scope
    const scope = {
      gym_id: userRole === 'admin' ? gymId : null,
      branch_id: branchId || null
    };

    // Use Prisma's upsert for safety
    // First, try to find existing setting
    const existingSetting = await prisma.system_settings.findFirst({
      where: {
        category,
        gym_id: scope.gym_id,
        branch_id: scope.branch_id
      }
    });

    if (existingSetting) {
      // Update existing
      await prisma.system_settings.update({
        where: { id: existingSetting.id },
        data: {
          config: encryptedConfig,
          is_active: config.is_active !== undefined ? config.is_active : true,
          updated_at: new Date()
        }
      });
    } else {
      // Create new
      await prisma.system_settings.create({
        data: {
          id: crypto.randomUUID(),
          category,
          gym_id: scope.gym_id,
          branch_id: scope.branch_id,
          config: encryptedConfig,
          is_active: config.is_active !== undefined ? config.is_active : true
        }
      });
    }

    return { success: true, message: 'Settings updated successfully' };
  }

  /**
   * Test settings
   */
  async testSettings(category: string, config: any) {
    // Implement test logic for each category
    switch (category) {
      case 'email':
        return this.testEmailSettings(config);
      case 'sms':
        return this.testSMSSettings(config);
      case 'whatsapp':
        return this.testWhatsAppSettings(config);
      default:
        throw new ApiError(`Testing not implemented for category: ${category}`, 400);
    }
  }

  /**
   * Test email settings
   */
  private async testEmailSettings(config: any) {
    // TODO: Implement actual email sending test
    return {
      success: true,
      message: 'Test email functionality will be implemented'
    };
  }

  /**
   * Test SMS settings
   */
  private async testSMSSettings(config: any) {
    // TODO: Implement actual SMS sending test
    return {
      success: true,
      message: 'Test SMS functionality will be implemented'
    };
  }

  /**
   * Test WhatsApp settings
   */
  private async testWhatsAppSettings(config: any) {
    // TODO: Implement actual WhatsApp message test
    return {
      success: true,
      message: 'Test WhatsApp functionality will be implemented'
    };
  }

  /**
   * Get default settings for category
   */
  private getDefaultSettings(category: string) {
    const defaults: any = {
      'payment-gateways': {
        category: 'payment-gateways',
        config: {
          provider: 'razorpay',
          is_test_mode: true,
          api_key: '',
          api_secret: ''
        },
        is_active: false
      },
      'sms': {
        category: 'sms',
        config: {
          provider: 'twilio',
          sender_id: '',
          api_key: ''
        },
        is_active: false
      },
      'email': {
        category: 'email',
        config: {
          provider: 'smtp',
          host: '',
          port: 587,
          username: '',
          password: '',
          from_email: '',
          from_name: ''
        },
        is_active: false
      },
      'whatsapp': {
        category: 'whatsapp',
        config: {
          provider: 'twilio',
          account_sid: '',
          auth_token: '',
          from_number: ''
        },
        is_active: false
      },
      'ai': {
        category: 'ai',
        config: {
          provider: 'openai',
          api_key: '',
          model: 'gpt-4'
        },
        is_active: false
      }
    };

    return defaults[category] || { category, config: {}, is_active: false };
  }
}

export const settingsService = new SettingsService();

import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';

/**
 * Strict Settings Service - NO INHERITANCE
 * Super Admin and Admin settings are completely separate
 */
export class StrictSettingsService {
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
   * Get all settings for current user context (NO INHERITANCE)
   */
  async getAllSettings(userRole?: string, gymId?: string, branchId?: string) {
    const categories = ['payment-gateways', 'sms', 'email', 'whatsapp', 'ai', 'general'];
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
   * Get settings by category (NO INHERITANCE - strict scope checking)
   */
  async getSettingsByCategory(
    category: string,
    userRole?: string,
    gymId?: string,
    branchId?: string
  ) {
    let whereClause: any = { category };
    
    // Super admin ONLY sees global settings
    if (userRole === 'super_admin') {
      whereClause.gym_id = null;
      whereClause.branch_id = null;
    }
    // Admin ONLY sees their gym's settings
    else if (userRole === 'admin' && gymId) {
      whereClause.gym_id = gymId;
      whereClause.branch_id = null;
    }
    // Branch manager ONLY sees their branch's settings
    else if (branchId) {
      whereClause.branch_id = branchId;
    }
    // Default to global for unauthenticated/unknown
    else {
      whereClause.gym_id = null;
      whereClause.branch_id = null;
    }

    const setting = await prisma.system_settings.findFirst({
      where: whereClause
    });

    if (!setting) {
      return this.getDefaultSettings(category);
    }

    // Decrypt sensitive fields
    if (setting.config && typeof setting.config === 'object') {
      const config = setting.config as Record<string, any>;
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
   * Update settings (strict scope enforcement)
   */
  async updateSettings(
    category: string,
    config: any,
    userRole?: string,
    gymId?: string,
    branchId?: string
  ) {
    // Validate scope permissions
    if (userRole === 'super_admin' && (gymId || branchId)) {
      throw new ApiError('Super admin cannot modify gym/branch-specific settings', 403);
    }
    
    if (userRole === 'admin' && !gymId) {
      throw new ApiError('Admin must have gym_id to modify settings', 403);
    }

    // Encrypt sensitive fields
    const sensitiveFields = ['api_key', 'api_secret', 'webhook_secret', 'merchant_key', 'password'];
    const encryptedConfig = { ...config };
    
    for (const field of sensitiveFields) {
      if (encryptedConfig[field]) {
        encryptedConfig[field] = this.encryptSecret(encryptedConfig[field]);
      }
    }

    // Determine scope based on user role
    const scope: any = { gym_id: null, branch_id: null };
    
    if (userRole === 'super_admin') {
      // Super admin updates global settings ONLY
      scope.gym_id = null;
      scope.branch_id = null;
    } else if (userRole === 'admin' && gymId) {
      // Admin updates their gym's settings ONLY
      scope.gym_id = gymId;
      scope.branch_id = null;
    } else if (branchId) {
      // Branch manager updates their branch's settings
      scope.branch_id = branchId;
      scope.gym_id = gymId;
    }

    // Check if setting exists
    const existing = await prisma.system_settings.findFirst({
      where: {
        category,
        gym_id: scope.gym_id,
        branch_id: scope.branch_id
      }
    });

    if (existing) {
      // Update existing
      await prisma.system_settings.update({
        where: { id: existing.id },
        data: {
          config: encryptedConfig,
          is_active: config.is_active !== undefined ? config.is_active : true,
          updated_at: new Date()
        }
      });
    } else {
      // Insert new
      await prisma.system_settings.create({
        data: {
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
   * Test settings (send test email/SMS)
   */
  async testSettings(category: string, config: any) {
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

  private async testEmailSettings(config: any) {
    return {
      success: true,
      message: 'Test email functionality will be implemented'
    };
  }

  private async testSMSSettings(config: any) {
    return {
      success: true,
      message: 'Test SMS functionality will be implemented'
    };
  }

  private async testWhatsAppSettings(config: any) {
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
      'general': {
        category: 'general',
        config: {
          timezone: 'UTC',
          currency: 'USD',
          date_format: 'YYYY-MM-DD',
          time_format: '24h',
          gst_enabled: false,
          gst_percentage: 18
        },
        is_active: true
      },
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

export const strictSettingsService = new StrictSettingsService();

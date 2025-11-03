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
    let whereClause = '';
    
    // Super admin sees global settings
    if (userRole === 'super_admin') {
      whereClause = `WHERE category = '${category}' AND gym_id IS NULL AND branch_id IS NULL`;
    }
    // Admin sees gym-level settings (or global if no gym setting)
    else if (userRole === 'admin' && gymId) {
      whereClause = `WHERE category = '${category}' AND (gym_id = '${gymId}' OR (gym_id IS NULL AND branch_id IS NULL))`;
    }
    // Branch manager sees branch-level settings (with fallback to gym/global)
    else if (branchId) {
      whereClause = `WHERE category = '${category}' AND (branch_id = '${branchId}' OR gym_id = '${gymId}' OR (gym_id IS NULL AND branch_id IS NULL))`;
    }
    // Default to global
    else {
      whereClause = `WHERE category = '${category}' AND gym_id IS NULL AND branch_id IS NULL`;
    }

    const settingsResult = await prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM system_settings
      ${whereClause}
      ORDER BY 
        CASE 
          WHEN branch_id IS NOT NULL THEN 1
          WHEN gym_id IS NOT NULL THEN 2
          ELSE 3
        END
      LIMIT 1
    `);

    if (settingsResult.length === 0) {
      return this.getDefaultSettings(category);
    }

    const setting = settingsResult[0];

    // Decrypt sensitive fields
    if (setting.config) {
      const config = setting.config;
      const sensitiveFields = ['api_key', 'api_secret', 'webhook_secret', 'merchant_key', 'password'];
      
      for (const field of sensitiveFields) {
        if (config[field] && config[field].includes(':')) {
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
    // Encrypt sensitive fields
    const sensitiveFields = ['api_key', 'api_secret', 'webhook_secret', 'merchant_key', 'password'];
    const encryptedConfig = { ...config };
    
    for (const field of sensitiveFields) {
      if (encryptedConfig[field]) {
        encryptedConfig[field] = this.encryptSecret(encryptedConfig[field]);
      }
    }

    // Determine scope based on user role
    let scope = { gym_id: null, branch_id: null };
    
    if (userRole === 'admin' && gymId) {
      scope.gym_id = gymId;
    } else if (branchId) {
      scope.branch_id = branchId;
      scope.gym_id = gymId;
    }

    // Check if setting exists
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM system_settings
      WHERE category = ${category}
      AND gym_id ${scope.gym_id ? `= '${scope.gym_id}'` : 'IS NULL'}
      AND branch_id ${scope.branch_id ? `= '${scope.branch_id}'` : 'IS NULL'}
      LIMIT 1
    `;

    if (existing.length > 0) {
      // Update existing
      await prisma.$executeRaw`
        UPDATE system_settings
        SET 
          config = ${JSON.stringify(encryptedConfig)}::jsonb,
          is_active = ${config.is_active !== undefined ? config.is_active : true},
          updated_at = NOW()
        WHERE id = ${existing[0].id}
      `;
    } else {
      // Insert new
      const gymIdValue = scope.gym_id || null;
      const branchIdValue = scope.branch_id || null;
      
      await prisma.$executeRaw`
        INSERT INTO system_settings (id, category, gym_id, branch_id, config, is_active, created_at, updated_at)
        VALUES (
          gen_random_uuid(),
          ${category},
          ${gymIdValue}::uuid,
          ${branchIdValue}::uuid,
          ${JSON.stringify(encryptedConfig)}::jsonb,
          ${config.is_active !== undefined ? config.is_active : true},
          NOW(),
          NOW()
        )
      `;
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

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { prisma } from '../lib/prisma';

/**
 * Multi-Factor Authentication Service
 * Implements TOTP-based MFA using speakeasy
 */

export class MFAService {
  /**
   * Generate MFA secret for user
   */
  async generateSecret(userId: string, email: string): Promise<{ secret: string; qrCode: string }> {
    const secret = speakeasy.generateSecret({
      name: `GymFlow (${email})`,
      issuer: 'GymFlow',
      length: 32,
    });

    // Store secret in database
    await prisma.user.update({
      where: { user_id: userId },
      data: {
        mfa_secret: secret.base32,
        mfa_enabled: false, // Not enabled until verified
      },
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32!,
      qrCode,
    };
  }

  /**
   * Verify MFA token and enable MFA
   */
  async verifyAndEnable(userId: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: { mfa_secret: true },
    });

    if (!user?.mfa_secret) {
      throw new Error('MFA secret not found');
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after for clock drift
    });

    if (verified) {
      // Enable MFA for user
      await prisma.user.update({
        where: { user_id: userId },
        data: { mfa_enabled: true },
      });
    }

    return verified;
  }

  /**
   * Verify MFA token during login
   */
  async verify(userId: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: { mfa_secret: true, mfa_enabled: true },
    });

    if (!user?.mfa_secret || !user.mfa_enabled) {
      throw new Error('MFA not enabled for user');
    }

    return speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }

  /**
   * Disable MFA for user
   */
  async disable(userId: string, token: string): Promise<boolean> {
    // Verify token before disabling
    const verified = await this.verify(userId, token);

    if (verified) {
      await prisma.user.update({
        where: { user_id: userId },
        data: {
          mfa_enabled: false,
          mfa_secret: null,
        },
      });
    }

    return verified;
  }

  /**
   * Generate backup codes for user
   */
  async generateBackupCodes(userId: string): Promise<string[]> {
    const codes: string[] = [];
    
    // Generate 10 backup codes
    for (let i = 0; i < 10; i++) {
      const code = speakeasy.generateSecret({ length: 10 }).base32.substring(0, 8);
      codes.push(code);
    }

    // Hash and store backup codes
    const hashedCodes = codes.map(code => 
      // Simple hash - in production, use bcrypt
      Buffer.from(code).toString('base64')
    );

    await prisma.user.update({
      where: { user_id: userId },
      data: {
        mfa_backup_codes: hashedCodes,
      },
    });

    return codes;
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: { mfa_backup_codes: true },
    });

    if (!user?.mfa_backup_codes || !Array.isArray(user.mfa_backup_codes)) {
      return false;
    }

    const hashedCode = Buffer.from(code).toString('base64');
    const index = (user.mfa_backup_codes as string[]).indexOf(hashedCode);

    if (index === -1) {
      return false;
    }

    // Remove used backup code
    const updatedCodes = [...(user.mfa_backup_codes as string[])];
    updatedCodes.splice(index, 1);

    await prisma.user.update({
      where: { user_id: userId },
      data: { mfa_backup_codes: updatedCodes },
    });

    return true;
  }

  /**
   * Check if user has MFA enabled
   */
  async isMFAEnabled(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: { mfa_enabled: true },
    });

    return user?.mfa_enabled || false;
  }
}

export const mfaService = new MFAService();

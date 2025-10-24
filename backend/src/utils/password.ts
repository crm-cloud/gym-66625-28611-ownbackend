import { hashPassword, verifyPassword } from './crypto-utils';

/**
 * Hash password with PBKDF2
 * @param password The plain text password to hash
 * @returns A hashed password string
 */
export async function hashPasswordCrypto(password: string): Promise<string> {
  return hashPassword(password);
}

/**
 * Compare password with hash
 * @param password The plain text password to verify
 * @param hash The stored hash to compare against
 * @returns boolean indicating if the password matches the hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return verifyPassword(password, hash);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export { hashPassword, verifyPassword, updatePasswordHash } from './crypto-utils';

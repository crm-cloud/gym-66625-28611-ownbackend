import crypto from 'crypto';

/**
 * Hashes a password using PBKDF2 with a random salt
 * @param password The plain text password to hash
 * @returns A string containing the salt and hash in the format: "salt:iterations:keylen:digest:hash"
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 10000;
  const keylen = 64;
  const digest = 'sha512';
  
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
  return `${salt}:${iterations}:${keylen}:${digest}:${hash}`;
}

/**
 * Verifies a password against a stored hash
 * @param password The plain text password to verify
 * @param storedHash The stored hash in the format "salt:iterations:keylen:digest:hash"
 * @returns boolean indicating if the password matches the hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, iterations, keylen, digest, hash] = storedHash.split(':');
    
    // If the stored hash doesn't have all the required parts, it's not in the expected format
    if (!salt || !iterations || !keylen || !digest || !hash) {
      return false;
    }
    
    const hashVerify = crypto.pbkdf2Sync(
      password,
      salt,
      parseInt(iterations, 10),
      parseInt(keylen, 10),
      digest as crypto.BinaryToTextEncoding
    ).toString('hex');
    
    return hash === hashVerify;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Creates a new password hash
 * This is an alias for hashPassword that maintains backward compatibility
 * @param plainPassword The plain text password
 * @returns A new hashed password string
 */
export function updatePasswordHash(plainPassword: string): string {
  return hashPassword(plainPassword);
}

/**
 * Validate password strength
 * @param password The password to validate
 * @returns Object with valid flag and array of error messages
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

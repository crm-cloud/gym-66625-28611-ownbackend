// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// User Roles - Must match user_role enum in schema.prisma
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  TRAINER: 'trainer',
  STAFF: 'staff',
  MEMBER: 'member',
} as const;

// Default pagination values
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;

// Cache TTL in seconds
export const CACHE_TTL = 60 * 60; // 1 hour

// File upload limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

// Export all constants as default
export default {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ROLES,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  CACHE_TTL,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
};

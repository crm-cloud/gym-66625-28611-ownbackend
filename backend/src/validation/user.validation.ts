import { z } from 'zod';

// User creation schema
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
  role: z.enum(['super_admin', 'admin', 'manager', 'staff', 'trainer', 'member']),
  branch_id: z.string().uuid().optional(),
  gym_id: z.string().uuid().optional(),
  avatar_url: z.string().url().optional().nullable(),
  is_active: z.boolean().optional().default(true)
});

// User update schema
export const updateUserSchema = z.object({
  full_name: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional().nullable(),
  is_active: z.boolean().optional(),
  branch_id: z.string().uuid().optional().nullable(),
  gym_id: z.string().uuid().optional().nullable()
});

// User query schema
export const userQuerySchema = z.object({
  branch_id: z.string().uuid().optional(),
  gym_id: z.string().uuid().optional(),
  role: z.enum(['super_admin', 'admin', 'manager', 'staff', 'trainer', 'member']).optional(),
  is_active: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50)
});

// Profile update schema (for authenticated user)
export const updateProfileSchema = z.object({
  full_name: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional().nullable(),
  bio: z.string().optional()
});

// Export types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

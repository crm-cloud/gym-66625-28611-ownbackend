import { z } from 'zod';

// Role creation schema
export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  display_name: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  is_system: z.boolean().optional().default(false),
  permission_ids: z.array(z.string().uuid()).optional().default([])
});

// Role update schema
export const updateRoleSchema = z.object({
  display_name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional()
});

// Permission assignment schema
export const assignPermissionsSchema = z.object({
  permission_ids: z.array(z.string().uuid())
});

// User role assignment schema
export const assignUserRoleSchema = z.object({
  user_id: z.string().uuid(),
  role_id: z.string().uuid()
});

// Export types
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AssignPermissionsInput = z.infer<typeof assignPermissionsSchema>;
export type AssignUserRoleInput = z.infer<typeof assignUserRoleSchema>;

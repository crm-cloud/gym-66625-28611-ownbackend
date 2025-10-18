import { z } from 'zod';

// Create gym schema
export const createGymSchema = z.object({
  name: z.string().min(1, 'Gym name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  postal_code: z.string().optional(),
  subscription_plan: z.enum(['free', 'basic', 'premium', 'enterprise']).default('free'),
  subscription_start_date: z.string().optional(),
  subscription_end_date: z.string().optional(),
  max_branches: z.number().int().positive().default(1),
  max_members: z.number().int().positive().default(100),
  is_active: z.boolean().default(true)
});

// Update gym schema
export const updateGymSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  subscription_plan: z.enum(['free', 'basic', 'premium', 'enterprise']).optional(),
  subscription_end_date: z.string().optional(),
  max_branches: z.number().int().positive().optional(),
  max_members: z.number().int().positive().optional(),
  is_active: z.boolean().optional()
});

// Gym query schema
export const gymQuerySchema = z.object({
  subscription_plan: z.enum(['free', 'basic', 'premium', 'enterprise']).optional(),
  is_active: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50)
});

// Export types
export type CreateGymInput = z.infer<typeof createGymSchema>;
export type UpdateGymInput = z.infer<typeof updateGymSchema>;
export type GymQueryInput = z.infer<typeof gymQuerySchema>;

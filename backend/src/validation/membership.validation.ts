import { z } from 'zod';

export const createMembershipPlanSchema = z.object({
  name: z.string().min(2, 'Plan name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  duration_days: z.number().int().min(1, 'Duration must be at least 1 day'),
  price: z.number().min(0, 'Price must be positive'),
  branch_id: z.string().uuid('Invalid branch ID').optional(),
  features: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
  max_classes_per_month: z.number().int().min(0).optional(),
  includes_personal_training: z.boolean().default(false),
  category: z.enum(['basic', 'standard', 'premium', 'vip']).optional()
});

export const updateMembershipPlanSchema = createMembershipPlanSchema.partial();

export const membershipPlanQuerySchema = z.object({
  branch_id: z.string().uuid().optional(),
  is_active: z.boolean().optional(),
  category: z.enum(['basic', 'standard', 'premium', 'vip']).optional(),
  min_price: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  max_price: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional()
});

export type CreateMembershipPlanInput = z.infer<typeof createMembershipPlanSchema>;
export type UpdateMembershipPlanInput = z.infer<typeof updateMembershipPlanSchema>;
export type MembershipPlanQueryInput = z.infer<typeof membershipPlanQuerySchema>;

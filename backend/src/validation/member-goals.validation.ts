import { z } from 'zod';

// Create goal schema
export const createGoalSchema = z.object({
  member_id: z.string().uuid('Invalid member ID'),
  goal_type: z.enum(['weight_loss', 'weight_gain', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness', 'custom']),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().optional(),
  target_value: z.number().optional(),
  current_value: z.number().optional(),
  unit: z.string().optional(),
  start_date: z.string(),
  target_date: z.string(),
  status: z.enum(['active', 'completed', 'cancelled']).default('active')
});

// Update goal schema
export const updateGoalSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  target_value: z.number().optional(),
  current_value: z.number().optional(),
  target_date: z.string().optional(),
  status: z.enum(['active', 'completed', 'cancelled']).optional()
});

// Log progress schema
export const logProgressSchema = z.object({
  value: z.number(),
  notes: z.string().optional(),
  recorded_at: z.string().optional()
});

// Query schema
export const goalsQuerySchema = z.object({
  member_id: z.string().uuid().optional(),
  goal_type: z.string().optional(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50)
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type LogProgressInput = z.infer<typeof logProgressSchema>;
export type GoalsQueryInput = z.infer<typeof goalsQuerySchema>;

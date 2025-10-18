import { z } from 'zod';

export const createDietPlanSchema = z.object({
  member_id: z.string().uuid(),
  trainer_id: z.string().uuid().optional(),
  plan_name: z.string().min(1).max(200),
  plan_data: z.any(), // JSON data
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  notes: z.string().optional()
});

export const updateDietPlanSchema = createDietPlanSchema.partial();

export const createWorkoutPlanSchema = z.object({
  member_id: z.string().uuid(),
  trainer_id: z.string().uuid().optional(),
  plan_name: z.string().min(1).max(200),
  plan_data: z.any(), // JSON data
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  notes: z.string().optional()
});

export const updateWorkoutPlanSchema = createWorkoutPlanSchema.partial();

export const planFiltersSchema = z.object({
  member_id: z.string().uuid().optional(),
  trainer_id: z.string().uuid().optional(),
  is_active: z.boolean().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
});

import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().min(2, 'Class name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  trainer_id: z.string().uuid('Invalid trainer ID'),
  branch_id: z.string().uuid('Invalid branch ID'),
  start_time: z.string().datetime('Invalid start time'),
  end_time: z.string().datetime('Invalid end time'),
  max_capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  status: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled']).default('scheduled'),
  class_type: z.string().max(100).optional(),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']).default('none')
});

export const updateClassSchema = createClassSchema.partial();

export const classQuerySchema = z.object({
  branch_id: z.string().uuid().optional(),
  trainer_id: z.string().uuid().optional(),
  status: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled']).optional(),
  class_type: z.string().optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional()
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type ClassQueryInput = z.infer<typeof classQuerySchema>;

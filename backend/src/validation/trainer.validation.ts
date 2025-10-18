import { z } from 'zod';

export const createTrainerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  specialization: z.string().max(200).optional(),
  certification: z.string().max(200).optional(),
  experience_years: z.number().int().min(0).optional(),
  branch_id: z.string().uuid('Invalid branch ID'),
  user_id: z.string().uuid('Invalid user ID').optional(),
  hourly_rate: z.number().min(0).optional(),
  is_active: z.boolean().default(true),
  bio: z.string().max(1000).optional(),
  joining_date: z.string().optional()
});

export const updateTrainerSchema = createTrainerSchema.partial();

export const trainerQuerySchema = z.object({
  branch_id: z.string().uuid().optional(),
  is_active: z.boolean().optional(),
  specialization: z.string().optional(),
  search: z.string().optional()
});

export type CreateTrainerInput = z.infer<typeof createTrainerSchema>;
export type UpdateTrainerInput = z.infer<typeof updateTrainerSchema>;
export type TrainerQueryInput = z.infer<typeof trainerQuerySchema>;

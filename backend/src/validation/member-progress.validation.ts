import { z } from 'zod';

// Measurement History Validation
export const createMeasurementSchema = z.object({
  member_id: z.string().uuid(),
  measured_date: z.string().datetime(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  body_fat_percentage: z.number().min(0).max(100).optional(),
  muscle_mass: z.number().positive().optional(),
  bmi: z.number().positive().optional(),
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  hips: z.number().positive().optional(),
  biceps: z.number().positive().optional(),
  thighs: z.number().positive().optional(),
  notes: z.string().max(1000).optional(),
  images: z.array(z.string()).optional(),
});

export const updateMeasurementSchema = createMeasurementSchema.partial().extend({
  id: z.string().uuid(),
});

// Member Goal Validation
export const createGoalSchema = z.object({
  member_id: z.string().uuid(),
  goal_type: z.enum(['weight_loss', 'weight_gain', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'custom']),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  target_value: z.number().optional(),
  current_value: z.number().optional(),
  unit: z.string().max(20).optional(),
  target_date: z.string().datetime().optional(),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).default('active'),
});

export const updateGoalSchema = createGoalSchema.partial().extend({
  id: z.string().uuid(),
});

export const updateGoalProgressSchema = z.object({
  id: z.string().uuid(),
  current_value: z.number(),
});

// Progress Photos Validation
export const uploadProgressPhotoSchema = z.object({
  member_id: z.string().uuid(),
  photo_type: z.enum(['front', 'back', 'side', 'other']),
  notes: z.string().max(500).optional(),
});

export const deleteProgressPhotoSchema = z.object({
  id: z.string().uuid(),
});

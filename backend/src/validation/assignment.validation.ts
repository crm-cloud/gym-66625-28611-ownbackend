import { z } from 'zod';

// Create trainer assignment schema
export const createAssignmentSchema = z.object({
  trainer_id: z.string().uuid('Invalid trainer ID'),
  member_id: z.string().uuid('Invalid member ID'),
  session_type: z.enum(['single', 'package']),
  package_id: z.string().uuid().optional(),
  scheduled_date: z.string(),
  duration: z.number().int().positive().default(60),
  session_specialty: z.string().min(1, 'Session specialty is required'),
  notes: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  payment_method: z.string().optional(),
  assigned_by: z.enum(['auto', 'manual', 'member_request']).default('manual')
});

// Update assignment schema
export const updateAssignmentSchema = z.object({
  scheduled_date: z.string().optional(),
  duration: z.number().int().positive().optional(),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled']).optional(),
  trainer_notes: z.string().optional()
});

// Complete assignment schema
export const completeAssignmentSchema = z.object({
  trainer_notes: z.string().optional(),
  member_rating: z.number().int().min(1).max(5).optional(),
  member_feedback: z.string().optional()
});

// Assignment query schema
export const assignmentQuerySchema = z.object({
  trainer_id: z.string().uuid().optional(),
  member_id: z.string().uuid().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled']).optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  session_type: z.enum(['single', 'package']).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50)
});

// Auto-assignment request schema
export const autoAssignmentSchema = z.object({
  member_id: z.string().uuid(),
  session_specialty: z.string().min(1),
  scheduled_date: z.string(),
  duration: z.number().int().positive().default(60),
  preferences: z.object({
    preferred_gender: z.enum(['male', 'female']).optional(),
    min_rating: z.number().min(0).max(5).optional(),
    max_hourly_rate: z.number().positive().optional()
  }).optional()
});

// Export types
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type CompleteAssignmentInput = z.infer<typeof completeAssignmentSchema>;
export type AssignmentQueryInput = z.infer<typeof assignmentQuerySchema>;
export type AutoAssignmentInput = z.infer<typeof autoAssignmentSchema>;

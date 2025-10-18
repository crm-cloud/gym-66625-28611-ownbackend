import { z } from 'zod';

// Create trainer change request schema
export const createTrainerChangeSchema = z.object({
  member_id: z.string().uuid('Invalid member ID'),
  current_trainer_id: z.string().uuid('Invalid trainer ID'),
  requested_trainer_id: z.string().uuid().optional(),
  reason: z.enum(['scheduling_conflict', 'personality_mismatch', 'specialty_change', 'performance_issue', 'other']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  urgency: z.enum(['low', 'medium', 'high']).default('medium')
});

// Review change request schema
export const reviewChangeRequestSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  review_notes: z.string().optional(),
  new_trainer_id: z.string().uuid().optional()
});

// Change request query schema
export const changeRequestQuerySchema = z.object({
  member_id: z.string().uuid().optional(),
  current_trainer_id: z.string().uuid().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'completed']).optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50)
});

// Export types
export type CreateTrainerChangeInput = z.infer<typeof createTrainerChangeSchema>;
export type ReviewChangeRequestInput = z.infer<typeof reviewChangeRequestSchema>;
export type ChangeRequestQueryInput = z.infer<typeof changeRequestQuerySchema>;

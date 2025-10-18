import { z } from 'zod';

export const createFeedbackSchema = z.object({
  member_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  category: z.enum(['facilities', 'trainers', 'classes', 'equipment', 'service', 'other']),
  subject: z.string().min(1).max(200),
  message: z.string().min(1),
  is_anonymous: z.boolean().optional(),
  branch_id: z.string().uuid()
});

export const updateFeedbackSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'resolved']),
  admin_response: z.string().optional()
});

export const feedbackFiltersSchema = z.object({
  member_id: z.string().uuid().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  rating: z.string().optional(),
  branch_id: z.string().uuid().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
});

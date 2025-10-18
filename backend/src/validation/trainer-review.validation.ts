import { z } from 'zod';

// Create trainer review schema
export const createTrainerReviewSchema = z.object({
  trainer_id: z.string().uuid('Invalid trainer ID'),
  member_id: z.string().uuid('Invalid member ID'),
  assignment_id: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().optional(),
  professionalism_rating: z.number().int().min(1).max(5).optional(),
  knowledge_rating: z.number().int().min(1).max(5).optional(),
  communication_rating: z.number().int().min(1).max(5).optional()
});

// Update review schema
export const updateTrainerReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  review_text: z.string().optional(),
  professionalism_rating: z.number().int().min(1).max(5).optional(),
  knowledge_rating: z.number().int().min(1).max(5).optional(),
  communication_rating: z.number().int().min(1).max(5).optional(),
  is_verified: z.boolean().optional(),
  is_featured: z.boolean().optional()
});

// Review query schema
export const reviewQuerySchema = z.object({
  trainer_id: z.string().uuid().optional(),
  member_id: z.string().uuid().optional(),
  min_rating: z.number().int().min(1).max(5).optional(),
  is_verified: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50)
});

// Export types
export type CreateTrainerReviewInput = z.infer<typeof createTrainerReviewSchema>;
export type UpdateTrainerReviewInput = z.infer<typeof updateTrainerReviewSchema>;
export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>;

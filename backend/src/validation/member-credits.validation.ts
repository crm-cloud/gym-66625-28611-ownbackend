import { z } from 'zod';

// Add credits schema
export const addCreditsSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  transaction_type: z.enum(['purchase', 'refund', 'bonus', 'adjustment']),
  reference_id: z.string().optional(),
  notes: z.string().optional()
});

// Deduct credits schema
export const deductCreditsSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  transaction_type: z.enum(['purchase', 'redemption', 'adjustment']),
  reference_id: z.string().optional(),
  notes: z.string().optional()
});

// Query schema
export const creditsQuerySchema = z.object({
  member_id: z.string().uuid().optional(),
  transaction_type: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50)
});

// Export types
export type AddCreditsInput = z.infer<typeof addCreditsSchema>;
export type DeductCreditsInput = z.infer<typeof deductCreditsSchema>;
export type CreditsQueryInput = z.infer<typeof creditsQuerySchema>;

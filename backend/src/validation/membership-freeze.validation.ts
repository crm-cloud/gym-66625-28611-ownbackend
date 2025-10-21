import { z } from 'zod';

// Request freeze schema
export const requestFreezeSchema = z.object({
  member_id: z.string().uuid('Invalid member ID'),
  freeze_from: z.string(),
  freeze_to: z.string(),
  reason: z.string().min(10, 'Reason must be at least 10 characters').optional(),
  notes: z.string().optional()
});

// Update freeze request schema
export const updateFreezeRequestSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']),
  admin_notes: z.string().optional(),
  fee_amount: z.number().min(0).optional()
});

// Query schema
export const freezeQuerySchema = z.object({
  member_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50)
});

// Export types
export type RequestFreezeInput = z.infer<typeof requestFreezeSchema>;
export type UpdateFreezeRequestInput = z.infer<typeof updateFreezeRequestSchema>;
export type FreezeQueryInput = z.infer<typeof freezeQuerySchema>;

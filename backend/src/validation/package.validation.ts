import { z } from 'zod';

// Create training package schema
export const createPackageSchema = z.object({
  member_id: z.string().uuid('Invalid member ID'),
  trainer_id: z.string().uuid('Invalid trainer ID'),
  sessions_total: z.number().int().positive('Sessions must be positive'),
  validity_days: z.number().int().positive('Validity days must be positive'),
  total_amount: z.number().positive('Amount must be positive'),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).default('pending'),
  payment_id: z.string().optional()
});

// Update package schema
export const updatePackageSchema = z.object({
  status: z.enum(['active', 'expired', 'cancelled', 'completed']).optional(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  payment_id: z.string().optional()
});

// Package query schema
export const packageQuerySchema = z.object({
  member_id: z.string().uuid().optional(),
  trainer_id: z.string().uuid().optional(),
  status: z.enum(['active', 'expired', 'cancelled', 'completed']).optional(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50)
});

// Export types
export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type PackageQueryInput = z.infer<typeof packageQuerySchema>;

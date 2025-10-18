import { z } from 'zod';

export const createBranchSchema = z.object({
  name: z.string().min(2, 'Branch name must be at least 2 characters').max(100),
  code: z.string().min(2, 'Branch code must be at least 2 characters').max(20).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits').optional(),
  email: z.string().email('Invalid email address').optional(),
  manager_id: z.string().uuid('Invalid manager ID').optional(),
  gym_id: z.string().uuid('Invalid gym ID').optional(),
  opening_time: z.string().optional(),
  closing_time: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active')
});

export const updateBranchSchema = createBranchSchema.partial();

export const branchQuerySchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  gym_id: z.string().uuid().optional(),
  search: z.string().optional()
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
export type BranchQueryInput = z.infer<typeof branchQuerySchema>;

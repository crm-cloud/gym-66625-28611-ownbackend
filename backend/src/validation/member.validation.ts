import { z } from 'zod';

export const createMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().max(500).optional(),
  emergency_contact: z.string().max(100).optional(),
  emergency_phone: z.string().regex(/^[0-9]{10}$/, 'Emergency phone must be 10 digits').optional(),
  branch_id: z.string().uuid('Invalid branch ID'),
  assigned_trainer_id: z.string().uuid('Invalid trainer ID').optional(),
  membership_plan_id: z.string().uuid('Invalid membership plan ID').optional(),
  joining_date: z.string().optional(),
  notes: z.string().max(1000).optional(),
  user_id: z.string().uuid('Invalid user ID').optional()
});

export const updateMemberSchema = createMemberSchema.partial();

export const memberQuerySchema = z.object({
  branch_id: z.string().uuid().optional(),
  trainer_id: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type MemberQueryInput = z.infer<typeof memberQuerySchema>;

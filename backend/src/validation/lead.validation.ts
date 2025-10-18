import { z } from 'zod';

// Create lead schema
export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().min(1, 'Phone is required'),
  source: z.enum(['website', 'referral', 'walk_in', 'social_media', 'phone_call', 'other']).default('walk_in'),
  interest_level: z.enum(['cold', 'warm', 'hot']).default('warm'),
  preferred_membership: z.string().optional(),
  notes: z.string().optional(),
  branch_id: z.string().uuid('Invalid branch ID'),
  assigned_to: z.string().uuid().optional()
});

// Update lead schema
export const updateLeadSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  source: z.enum(['website', 'referral', 'walk_in', 'social_media', 'phone_call', 'other']).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'negotiation', 'converted', 'lost']).optional(),
  interest_level: z.enum(['cold', 'warm', 'hot']).optional(),
  preferred_membership: z.string().optional(),
  notes: z.string().optional(),
  assigned_to: z.string().uuid().optional()
});

// Lead query schema
export const leadQuerySchema = z.object({
  branch_id: z.string().uuid().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'negotiation', 'converted', 'lost']).optional(),
  interest_level: z.enum(['cold', 'warm', 'hot']).optional(),
  source: z.enum(['website', 'referral', 'walk_in', 'social_media', 'phone_call', 'other']).optional(),
  assigned_to: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50)
});

// Follow-up schema
export const createFollowUpSchema = z.object({
  lead_id: z.string().uuid('Invalid lead ID'),
  notes: z.string().min(1, 'Follow-up notes are required'),
  next_follow_up_date: z.string().optional(),
  contacted_via: z.enum(['phone', 'email', 'sms', 'in_person', 'whatsapp']).default('phone')
});

// Convert lead to member schema
export const convertLeadSchema = z.object({
  membership_plan_id: z.string().uuid('Invalid membership plan ID'),
  start_date: z.string().optional(),
  payment_method: z.enum(['cash', 'card', 'upi', 'online']).default('cash')
});

// Export types
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadQueryInput = z.infer<typeof leadQuerySchema>;
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
export type ConvertLeadInput = z.infer<typeof convertLeadSchema>;

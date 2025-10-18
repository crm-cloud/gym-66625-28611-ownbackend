import { z } from 'zod';

// Create subscription schema
export const createSubscriptionSchema = z.object({
  member_id: z.string().min(1, 'Member ID is required'),
  membership_plan_id: z.string().min(1, 'Membership plan ID is required'),
  start_date: z.string().optional(),
  payment_method: z.enum(['cash', 'card', 'upi', 'online']).optional(),
  discount_amount: z.number().min(0).optional(),
  discount_code: z.string().optional(),
  notes: z.string().optional()
});

// Update subscription schema
export const updateSubscriptionSchema = z.object({
  end_date: z.string().optional(),
  status: z.enum(['active', 'expired', 'cancelled', 'frozen']).optional(),
  notes: z.string().optional()
});

// Freeze subscription schema
export const freezeSubscriptionSchema = z.object({
  freeze_from: z.string(),
  freeze_to: z.string(),
  reason: z.string().optional()
});

// Renew subscription schema
export const renewSubscriptionSchema = z.object({
  membership_plan_id: z.string().optional(), // Can change plan on renewal
  payment_method: z.enum(['cash', 'card', 'upi', 'online']),
  discount_amount: z.number().min(0).optional(),
  discount_code: z.string().optional()
});

// Subscription query schema
export const subscriptionQuerySchema = z.object({
  member_id: z.string().optional(),
  branch_id: z.string().optional(),
  status: z.enum(['active', 'expired', 'cancelled', 'frozen']).optional(),
  expiring_in_days: z.number().int().positive().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50)
});

// Billing cycle schema
export const billingCycleQuerySchema = z.object({
  branch_id: z.string().optional(),
  from_date: z.string(),
  to_date: z.string()
});

// Export types
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type FreezeSubscriptionInput = z.infer<typeof freezeSubscriptionSchema>;
export type RenewSubscriptionInput = z.infer<typeof renewSubscriptionSchema>;
export type SubscriptionQueryInput = z.infer<typeof subscriptionQuerySchema>;
export type BillingCycleQueryInput = z.infer<typeof billingCycleQuerySchema>;

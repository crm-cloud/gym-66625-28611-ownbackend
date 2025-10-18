import { z } from 'zod';

export const createReferralSchema = z.object({
  referrer_id: z.string().uuid(),
  referred_email: z.string().email(),
  referred_name: z.string().min(1),
  referred_phone: z.string().optional(),
  notes: z.string().optional()
});

export const updateReferralSchema = z.object({
  status: z.enum(['pending', 'signed_up', 'active_member', 'expired']),
  referred_member_id: z.string().uuid().optional(),
  conversion_date: z.string().datetime().optional(),
  notes: z.string().optional()
});

export const referralFiltersSchema = z.object({
  referrer_id: z.string().uuid().optional(),
  status: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
});

export const createRewardSchema = z.object({
  user_id: z.string().uuid(),
  reward_type: z.enum(['referral_bonus', 'achievement', 'loyalty', 'promotional']),
  points: z.number().int().min(0).optional(),
  amount: z.number().min(0).optional(),
  description: z.string().min(1),
  expiry_date: z.string().datetime().optional()
});

export const updateRewardSchema = z.object({
  status: z.enum(['pending', 'claimed', 'expired']),
  claimed_date: z.string().datetime().optional()
});

-- Phase 1: Database Schema Migration - Add missing foreign keys and audit columns

-- Add missing columns to member_memberships table
ALTER TABLE public.member_memberships 
ADD COLUMN IF NOT EXISTS assigned_by uuid REFERENCES public.profiles(user_id),
ADD COLUMN IF NOT EXISTS branch_id uuid,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS discount_percent numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS gst_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gst_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_amount numeric DEFAULT 0;

-- Add membership_id to invoices table
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS membership_id uuid REFERENCES public.member_memberships(id);

-- Add membership_id and invoice_id to transactions table (create if not exists)
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_id uuid REFERENCES public.member_memberships(id),
  invoice_id uuid REFERENCES public.invoices(id),
  member_id uuid REFERENCES public.members(id),
  amount numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL,
  payment_status text DEFAULT 'pending',
  reference_number text,
  notes text,
  branch_id uuid,
  recorded_by uuid REFERENCES public.profiles(user_id),
  payment_date timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add membership_id to member_measurements table
ALTER TABLE public.member_measurements 
ADD COLUMN IF NOT EXISTS membership_id uuid REFERENCES public.member_memberships(id);

-- Add membership_id to referrals table
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS membership_id uuid REFERENCES public.member_memberships(id),
ADD COLUMN IF NOT EXISTS converted_at timestamp with time zone;

-- Create membership_freeze_requests table if not exists
CREATE TABLE IF NOT EXISTS public.membership_freeze_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_id uuid NOT NULL REFERENCES public.member_memberships(id),
  member_id uuid NOT NULL REFERENCES public.members(id),
  request_date timestamp with time zone NOT NULL DEFAULT now(),
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  request_status text DEFAULT 'pending',
  approved_by uuid REFERENCES public.profiles(user_id),
  approved_at timestamp with time zone,
  branch_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create referral_bonuses table if not exists
CREATE TABLE IF NOT EXISTS public.referral_bonuses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id uuid NOT NULL REFERENCES public.referrals(id),
  membership_id uuid REFERENCES public.member_memberships(id),
  transaction_id uuid REFERENCES public.transactions(id),
  bonus_amount numeric NOT NULL DEFAULT 0,
  bonus_type text DEFAULT 'membership_conversion',
  paid_status text DEFAULT 'pending',
  paid_at timestamp with time zone,
  branch_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_freeze_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_bonuses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transactions
CREATE POLICY "Staff can manage transactions" ON public.transactions
FOR ALL USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Members can view own transactions" ON public.transactions
FOR SELECT USING (
  member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())
);

-- Create RLS policies for membership_freeze_requests
CREATE POLICY "Staff can manage freeze requests" ON public.membership_freeze_requests
FOR ALL USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Members can view own freeze requests" ON public.membership_freeze_requests
FOR SELECT USING (
  member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())
);

CREATE POLICY "Members can create freeze requests" ON public.membership_freeze_requests
FOR INSERT WITH CHECK (
  member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())
);

-- Create RLS policies for referral_bonuses
CREATE POLICY "Staff can manage referral bonuses" ON public.referral_bonuses
FOR ALL USING (is_staff_or_above(auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_member_memberships_member_id ON public.member_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_member_memberships_branch ON public.member_memberships(branch_id);
CREATE INDEX IF NOT EXISTS idx_transactions_membership ON public.transactions(membership_id);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice ON public.transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_transactions_member ON public.transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_member_measurements_membership ON public.member_measurements(membership_id);
CREATE INDEX IF NOT EXISTS idx_referrals_membership ON public.referrals(membership_id);

-- Update member_memberships to use proper plan reference
ALTER TABLE public.member_memberships 
DROP COLUMN IF EXISTS plan_id,
ADD COLUMN IF NOT EXISTS membership_plan_id uuid REFERENCES public.membership_plans(id);
-- Phase 1: Database Schema Migration - Add missing columns only

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

-- Add membership_id to invoices table if not exists
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS membership_id uuid;

-- Add membership_id to member_measurements table if not exists
ALTER TABLE public.member_measurements 
ADD COLUMN IF NOT EXISTS membership_id uuid;

-- Add membership_id and converted_at to referrals table if not exists
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS membership_id uuid,
ADD COLUMN IF NOT EXISTS converted_at timestamp with time zone;

-- Update member_memberships to use proper plan reference
ALTER TABLE public.member_memberships 
DROP COLUMN IF EXISTS plan_id,
ADD COLUMN IF NOT EXISTS membership_plan_id uuid REFERENCES public.membership_plans(id);

-- Create foreign key constraints if not exists (separate statements to avoid conflicts)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'invoices_membership_id_fkey' 
                 AND table_name = 'invoices') THEN
    ALTER TABLE public.invoices 
    ADD CONSTRAINT invoices_membership_id_fkey 
    FOREIGN KEY (membership_id) REFERENCES public.member_memberships(id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'member_measurements_membership_id_fkey' 
                 AND table_name = 'member_measurements') THEN
    ALTER TABLE public.member_measurements 
    ADD CONSTRAINT member_measurements_membership_id_fkey 
    FOREIGN KEY (membership_id) REFERENCES public.member_memberships(id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'referrals_membership_id_fkey' 
                 AND table_name = 'referrals') THEN
    ALTER TABLE public.referrals 
    ADD CONSTRAINT referrals_membership_id_fkey 
    FOREIGN KEY (membership_id) REFERENCES public.member_memberships(id);
  END IF;
END $$;
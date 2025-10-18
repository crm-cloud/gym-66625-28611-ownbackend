-- Phase 2: Create multi-tenant SaaS database schema

-- Create gym/tenant entity as the top-level tenant
CREATE TABLE public.gyms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subscription_plan TEXT NOT NULL DEFAULT 'basic',
  status TEXT NOT NULL DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  max_branches INTEGER DEFAULT 1,
  max_trainers INTEGER DEFAULT 5,
  max_members INTEGER DEFAULT 100,
  billing_email TEXT,
  billing_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS for gyms
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

-- Add gym_id to branches table for tenant isolation
ALTER TABLE public.branches ADD COLUMN gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE;

-- Add gym_id to profiles for tenant isolation
ALTER TABLE public.profiles ADD COLUMN gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL;

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly
  max_branches INTEGER NOT NULL DEFAULT 1,
  max_trainers INTEGER NOT NULL DEFAULT 5,
  max_members INTEGER NOT NULL DEFAULT 100,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gym usage tracking table
CREATE TABLE public.gym_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  month_year DATE NOT NULL,
  branch_count INTEGER DEFAULT 0,
  trainer_count INTEGER DEFAULT 0,
  member_count INTEGER DEFAULT 0,
  storage_used BIGINT DEFAULT 0, -- in bytes
  api_calls INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(gym_id, month_year)
);

-- Enable RLS for new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_usage ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for gyms table
CREATE POLICY "Super admins can manage all gyms" 
ON public.gyms 
FOR ALL 
USING (get_user_role(auth.uid()) = 'super-admin');

CREATE POLICY "Gym admins can view their own gym" 
ON public.gyms 
FOR SELECT 
USING (
  id IN (
    SELECT gym_id FROM public.profiles WHERE user_id = auth.uid() AND gym_id IS NOT NULL
  )
);

-- Update RLS policies for branches to include gym isolation
DROP POLICY IF EXISTS "Everyone can view active branches" ON public.branches;
DROP POLICY IF EXISTS "Admins can manage branches" ON public.branches;

CREATE POLICY "Super admins can manage all branches" 
ON public.branches 
FOR ALL 
USING (get_user_role(auth.uid()) = 'super-admin');

CREATE POLICY "Gym staff can manage their gym branches" 
ON public.branches 
FOR ALL 
USING (
  gym_id IN (
    SELECT gym_id FROM public.profiles WHERE user_id = auth.uid() AND gym_id IS NOT NULL
  ) AND is_staff_or_above(auth.uid())
);

CREATE POLICY "Everyone can view active branches in their gym" 
ON public.branches 
FOR SELECT 
USING (
  status = 'active' AND (
    gym_id IN (
      SELECT gym_id FROM public.profiles WHERE user_id = auth.uid() AND gym_id IS NOT NULL
    ) OR get_user_role(auth.uid()) = 'super-admin'
  )
);

-- Update RLS policies for profiles to include gym isolation
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (get_user_role(auth.uid()) = 'super-admin');

CREATE POLICY "Gym staff can view profiles in their gym" 
ON public.profiles 
FOR SELECT 
USING (
  gym_id IN (
    SELECT gym_id FROM public.profiles WHERE user_id = auth.uid() AND gym_id IS NOT NULL
  ) AND is_staff_or_above(auth.uid())
);

CREATE POLICY "Gym staff can manage profiles in their gym" 
ON public.profiles 
FOR UPDATE 
USING (
  gym_id IN (
    SELECT gym_id FROM public.profiles WHERE user_id = auth.uid() AND gym_id IS NOT NULL
  ) AND is_staff_or_above(auth.uid())
);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid());

-- RLS policies for subscription plans
CREATE POLICY "Everyone can view active subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Super admins can manage subscription plans" 
ON public.subscription_plans 
FOR ALL 
USING (get_user_role(auth.uid()) = 'super-admin');

-- RLS policies for gym usage
CREATE POLICY "Super admins can view all gym usage" 
ON public.gym_usage 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'super-admin');

CREATE POLICY "Gym admins can view their gym usage" 
ON public.gym_usage 
FOR SELECT 
USING (
  gym_id IN (
    SELECT gym_id FROM public.profiles WHERE user_id = auth.uid() AND gym_id IS NOT NULL
  )
);

CREATE POLICY "System can manage gym usage" 
ON public.gym_usage 
FOR ALL 
USING (true);

-- Create function to get user's gym_id
CREATE OR REPLACE FUNCTION public.get_user_gym_id(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT gym_id FROM profiles WHERE user_id = user_uuid;
$function$;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = user_uuid 
    AND role = 'super-admin'
  );
$function$;

-- Create trigger to update gym usage when new users/branches are created
CREATE OR REPLACE FUNCTION public.update_gym_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current month usage for the gym
  INSERT INTO public.gym_usage (gym_id, month_year, branch_count, trainer_count, member_count)
  VALUES (
    COALESCE(NEW.gym_id, OLD.gym_id),
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    (SELECT COUNT(*) FROM branches WHERE gym_id = COALESCE(NEW.gym_id, OLD.gym_id)),
    (SELECT COUNT(*) FROM profiles WHERE gym_id = COALESCE(NEW.gym_id, OLD.gym_id) AND role IN ('trainer')),
    (SELECT COUNT(*) FROM profiles WHERE gym_id = COALESCE(NEW.gym_id, OLD.gym_id) AND role = 'member')
  )
  ON CONFLICT (gym_id, month_year) 
  DO UPDATE SET
    branch_count = (SELECT COUNT(*) FROM branches WHERE gym_id = COALESCE(NEW.gym_id, OLD.gym_id)),
    trainer_count = (SELECT COUNT(*) FROM profiles WHERE gym_id = COALESCE(NEW.gym_id, OLD.gym_id) AND role = 'trainer'),
    member_count = (SELECT COUNT(*) FROM profiles WHERE gym_id = COALESCE(NEW.gym_id, OLD.gym_id) AND role = 'member');
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for usage tracking
CREATE TRIGGER update_gym_usage_on_branch_change
  AFTER INSERT OR UPDATE OR DELETE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_gym_usage();

CREATE TRIGGER update_gym_usage_on_profile_change
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_gym_usage();
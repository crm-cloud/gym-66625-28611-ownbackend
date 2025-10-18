-- Phase 1: Security Fixes & Role Migration to user_roles table

-- 1. Create security definer function to check roles safely (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_id = _user_id 
      AND role = _role
  );
$$;

-- 2. Migrate existing roles from profiles to user_roles table
INSERT INTO public.user_roles (user_id, role, branch_id, created_at)
SELECT 
  user_id, 
  role,
  branch_id,
  NOW()
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role, branch_id) DO NOTHING;

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 4. Update existing RLS policies to use has_role() function

-- Update profiles policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::user_role) 
  OR has_role(auth.uid(), 'super-admin'::user_role)
);

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
ON public.profiles FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::user_role) 
  OR has_role(auth.uid(), 'super-admin'::user_role)
);

-- Update branches policies
DROP POLICY IF EXISTS "Gym admins can manage their branches" ON public.branches;
CREATE POLICY "Gym admins can manage their branches"
ON public.branches FOR ALL
USING (
  has_role(auth.uid(), 'admin'::user_role)
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() 
      AND p.gym_id = branches.gym_id
  )
);

-- Update members policies
DROP POLICY IF EXISTS "Staff can manage members" ON public.members;
CREATE POLICY "Staff can manage members"
ON public.members FOR ALL
USING (
  has_role(auth.uid(), 'admin'::user_role)
  OR has_role(auth.uid(), 'manager'::user_role)
  OR has_role(auth.uid(), 'staff'::user_role)
  OR has_role(auth.uid(), 'trainer'::user_role)
);

-- 5. Add comment for documentation
COMMENT ON FUNCTION public.has_role IS 'Security definer function to check user roles from user_roles table, preventing RLS recursion';
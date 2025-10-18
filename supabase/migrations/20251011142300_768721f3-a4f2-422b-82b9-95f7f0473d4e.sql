-- Phase 1: Add team_role to user_roles table and migrate existing data

-- 1. Add team_role column to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS team_role TEXT;

-- 2. Migrate existing trainer/staff/manager roles to team structure
-- Update trainer users
UPDATE public.user_roles
SET role = 'team', team_role = 'trainer'
WHERE role = 'trainer';

-- Update staff users  
UPDATE public.user_roles
SET role = 'team', team_role = 'staff'
WHERE role = 'staff';

-- Update manager users
UPDATE public.user_roles
SET role = 'team', team_role = 'manager'
WHERE role = 'manager';

-- 3. Also update profiles table for consistency (since it has a role column)
UPDATE public.profiles
SET role = 'team'
WHERE role IN ('trainer', 'staff', 'manager');

-- 4. Create function to get user's team role
CREATE OR REPLACE FUNCTION public.get_user_team_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT team_role FROM user_roles 
  WHERE user_id = user_uuid 
  AND role = 'team'
  LIMIT 1;
$$;

-- 5. Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_team_role 
ON public.user_roles(user_id, team_role) 
WHERE role = 'team';

-- 6. Add check constraint to ensure team_role is valid
ALTER TABLE public.user_roles
ADD CONSTRAINT check_team_role_valid 
CHECK (
  (role != 'team' AND team_role IS NULL) OR
  (role = 'team' AND team_role IN ('trainer', 'staff', 'manager'))
);
-- Fix infinite recursion in profiles table RLS policies
-- Drop the problematic policies that cause circular references
DROP POLICY IF EXISTS "Gym staff can view profiles in their gym" ON public.profiles;
DROP POLICY IF EXISTS "Gym staff can manage profiles in their gym" ON public.profiles;

-- Recreate the policies using security definer functions to avoid recursion
CREATE POLICY "Gym staff can view profiles in their gym" 
ON public.profiles 
FOR SELECT 
USING (
  is_staff_or_above(auth.uid()) AND 
  (
    get_user_role(auth.uid()) = 'super-admin' OR
    gym_id = get_user_gym_id(auth.uid())
  )
);

CREATE POLICY "Gym staff can manage profiles in their gym" 
ON public.profiles 
FOR UPDATE 
USING (
  is_staff_or_above(auth.uid()) AND 
  (
    get_user_role(auth.uid()) = 'super-admin' OR
    gym_id = get_user_gym_id(auth.uid())
  )
);
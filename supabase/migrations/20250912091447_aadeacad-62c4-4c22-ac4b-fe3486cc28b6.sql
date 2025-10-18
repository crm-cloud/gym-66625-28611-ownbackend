-- Add branch_id to system_settings for hierarchical settings
ALTER TABLE public.system_settings 
ADD COLUMN branch_id UUID REFERENCES public.branches(id);

-- Create index for performance on branch-specific queries
CREATE INDEX idx_system_settings_branch_id ON public.system_settings(branch_id);
CREATE INDEX idx_system_settings_category_branch ON public.system_settings(category, branch_id);

-- Update RLS policies to support branch-specific access
DROP POLICY IF EXISTS "Staff can manage system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Staff can view system settings" ON public.system_settings;

-- Global settings (branch_id IS NULL) - only super admins can manage
CREATE POLICY "Super admins can manage global settings" 
ON public.system_settings 
FOR ALL 
USING (branch_id IS NULL AND get_user_role(auth.uid()) = 'super-admin');

-- Branch-specific settings - admins/managers can manage their branch settings
CREATE POLICY "Branch admins can manage branch settings" 
ON public.system_settings 
FOR ALL 
USING (
  branch_id IS NOT NULL 
  AND branch_id IN (
    SELECT b.id FROM branches b 
    JOIN profiles p ON p.gym_id = b.gym_id 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('admin', 'manager')
  )
);

-- Staff can view settings for their branch or global settings
CREATE POLICY "Staff can view relevant settings" 
ON public.system_settings 
FOR SELECT 
USING (
  (branch_id IS NULL) OR 
  (branch_id IN (
    SELECT b.id FROM branches b 
    JOIN profiles p ON p.gym_id = b.gym_id 
    WHERE p.user_id = auth.uid() 
    AND is_staff_or_above(auth.uid())
  ))
);
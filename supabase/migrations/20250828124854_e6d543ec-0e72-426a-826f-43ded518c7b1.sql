-- Add missing role values to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff'; 
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'trainer';

-- Create corrected helper functions using proper enum values
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role::text FROM profiles WHERE user_id = user_uuid;
$$;

-- Function to check if user is admin/super-admin (note the hyphen)
CREATE OR REPLACE FUNCTION is_admin_user(user_uuid uuid)
RETURNS boolean  
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = user_uuid 
    AND role IN ('admin', 'super-admin')
  );
$$;

-- Function to check if user is staff+ level
CREATE OR REPLACE FUNCTION is_staff_or_above(user_uuid uuid)
RETURNS boolean
LANGUAGE sql 
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = user_uuid 
    AND role IN ('super-admin', 'admin', 'manager', 'staff', 'trainer')
  );
$$;

-- Create RLS policies using correct enum values
-- Profiles table policies
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can view all profiles" ON profiles  
FOR SELECT USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage profiles" ON profiles
FOR ALL USING (is_admin_user(auth.uid()));

-- Equipment policies (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'equipment') THEN
    EXECUTE 'CREATE POLICY "Staff can view equipment" ON equipment FOR SELECT USING (is_staff_or_above(auth.uid()))';
    EXECUTE 'CREATE POLICY "Staff can manage equipment" ON equipment FOR ALL USING (is_staff_or_above(auth.uid()))';
  END IF;
END $$;

-- System settings policies (if table exists)  
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'system_settings') THEN
    EXECUTE 'CREATE POLICY "Admins can manage settings" ON system_settings FOR ALL USING (is_admin_user(auth.uid()))';
  END IF;
END $$;
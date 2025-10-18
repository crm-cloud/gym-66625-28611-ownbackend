-- Create comprehensive RLS policies for role-based access
-- First, create helper functions to avoid RLS recursion

-- Function to get current user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role::text FROM profiles WHERE user_id = user_uuid;
$$;

-- Function to check if user is admin/super admin
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
    AND role IN ('admin', 'super_admin')
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
    AND role IN ('super_admin', 'admin', 'manager', 'staff', 'trainer')
  );
$$;

-- Profiles table policies
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can view all profiles" ON profiles  
FOR SELECT USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage profiles" ON profiles
FOR ALL USING (is_admin_user(auth.uid()));

-- Equipment policies
CREATE POLICY "Staff can view equipment" ON equipment
FOR SELECT USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Staff can manage equipment" ON equipment  
FOR ALL USING (is_staff_or_above(auth.uid()));

-- Maintenance records policies  
CREATE POLICY "Staff can view maintenance records" ON maintenance_records
FOR SELECT USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Staff can manage maintenance records" ON maintenance_records
FOR ALL USING (is_staff_or_above(auth.uid()));

-- Diet plans policies
CREATE POLICY "Members can view active diet plans" ON diet_plans
FOR SELECT USING (status = 'active' OR created_by = auth.uid());

CREATE POLICY "Trainers can manage diet plans" ON diet_plans
FOR ALL USING (get_user_role(auth.uid()) IN ('trainer', 'admin', 'super_admin', 'manager'));

-- Workout plans policies  
CREATE POLICY "Members can view active workout plans" ON workout_plans
FOR SELECT USING (status = 'active' OR created_by = auth.uid());

CREATE POLICY "Trainers can manage workout plans" ON workout_plans
FOR ALL USING (get_user_role(auth.uid()) IN ('trainer', 'admin', 'super_admin', 'manager'));

-- Member diet plans policies
CREATE POLICY "Members can view own diet plans" ON member_diet_plans
FOR SELECT USING (user_id = auth.uid() OR assigned_by = auth.uid());

CREATE POLICY "Trainers can assign diet plans" ON member_diet_plans  
FOR ALL USING (get_user_role(auth.uid()) IN ('trainer', 'admin', 'super_admin', 'manager'));

-- Member workout plans policies
CREATE POLICY "Members can view own workout plans" ON member_workout_plans
FOR SELECT USING (user_id = auth.uid() OR assigned_by = auth.uid());

CREATE POLICY "Trainers can assign workout plans" ON member_workout_plans
FOR ALL USING (get_user_role(auth.uid()) IN ('trainer', 'admin', 'super_admin', 'manager'));

-- Team members policies
CREATE POLICY "Staff can view team members" ON team_members
FOR SELECT USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Managers can manage team members" ON team_members
FOR ALL USING (get_user_role(auth.uid()) IN ('manager', 'admin', 'super_admin'));

-- Trainer assignments policies  
CREATE POLICY "Members can view own assignments" ON trainer_assignments
FOR SELECT USING (member_id = auth.uid() OR trainer_id = auth.uid());

CREATE POLICY "Trainers can manage assignments" ON trainer_assignments
FOR ALL USING (get_user_role(auth.uid()) IN ('trainer', 'admin', 'super_admin', 'manager'));

-- Trainer packages policies
CREATE POLICY "Members can view own packages" ON trainer_packages  
FOR SELECT USING (member_id = auth.uid() OR trainer_id = auth.uid());

CREATE POLICY "Trainers can manage packages" ON trainer_packages
FOR ALL USING (get_user_role(auth.uid()) IN ('trainer', 'admin', 'super_admin', 'manager'));

-- System settings policies
CREATE POLICY "Admins can manage settings" ON system_settings
FOR ALL USING (is_admin_user(auth.uid()));

-- Email templates policies
CREATE POLICY "Staff can view email templates" ON email_templates
FOR SELECT USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Admins can manage email templates" ON email_templates
FOR ALL USING (is_admin_user(auth.uid()));

-- SMS templates policies  
CREATE POLICY "Staff can view sms templates" ON sms_templates
FOR SELECT USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Admins can manage sms templates" ON sms_templates
FOR ALL USING (is_admin_user(auth.uid()));
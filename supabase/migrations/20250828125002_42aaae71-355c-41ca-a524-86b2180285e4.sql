-- Create comprehensive RLS policies with correct enum values
-- Helper functions for role checking
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role::text FROM profiles WHERE user_id = user_uuid;
$$;

-- Function to check if user is admin/super-admin
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

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can view all profiles" ON profiles  
FOR SELECT USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage profiles" ON profiles
FOR ALL USING (is_admin_user(auth.uid()));

-- Branches policies  
CREATE POLICY "Everyone can view active branches" ON branches
FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage branches" ON branches
FOR ALL USING (is_admin_user(auth.uid()));

-- Members policies
CREATE POLICY "Staff can view members" ON members
FOR SELECT USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Staff can manage members" ON members
FOR ALL USING (is_staff_or_above(auth.uid()));

-- Attendance records policies
CREATE POLICY "Users can view own attendance" ON attendance_records
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can view all attendance" ON attendance_records
FOR SELECT USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Staff can manage attendance" ON attendance_records
FOR ALL USING (is_staff_or_above(auth.uid()));

-- Biometric devices policies
CREATE POLICY "Staff can manage devices" ON biometric_devices
FOR ALL USING (is_staff_or_above(auth.uid()));

-- Gym classes policies
CREATE POLICY "Everyone can view active classes" ON gym_classes
FOR SELECT USING (status = 'scheduled');

CREATE POLICY "Staff can manage classes" ON gym_classes
FOR ALL USING (is_staff_or_above(auth.uid()));

-- Class enrollments policies
CREATE POLICY "Members can view own enrollments" ON class_enrollments
FOR SELECT USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Staff can manage enrollments" ON class_enrollments
FOR ALL USING (is_staff_or_above(auth.uid()));

-- Feedback policies
CREATE POLICY "Users can view own feedback" ON feedback
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can view all feedback" ON feedback
FOR SELECT USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Users can create feedback" ON feedback
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff can manage feedback" ON feedback
FOR ALL USING (is_staff_or_above(auth.uid()));

-- Leads policies
CREATE POLICY "Staff can manage leads" ON leads
FOR ALL USING (is_staff_or_above(auth.uid()));

-- Lockers policies
CREATE POLICY "Staff can view lockers" ON lockers
FOR SELECT USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Staff can manage lockers" ON lockers
FOR ALL USING (is_staff_or_above(auth.uid()));

-- Trainer profiles policies
CREATE POLICY "Everyone can view active trainers" ON trainer_profiles
FOR SELECT USING (status = 'active');

CREATE POLICY "Trainers can update own profile" ON trainer_profiles
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage trainer profiles" ON trainer_profiles
FOR ALL USING (is_admin_user(auth.uid()));

-- Transactions policies
CREATE POLICY "Staff can manage transactions" ON transactions
FOR ALL USING (is_staff_or_above(auth.uid()));
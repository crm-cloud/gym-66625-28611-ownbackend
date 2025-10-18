-- Add comprehensive RLS policies for tables missing them

-- Equipment table
CREATE POLICY "Everyone can view active equipment" 
ON public.equipment 
FOR SELECT 
USING (status = 'operational');

CREATE POLICY "Staff can manage equipment" 
ON public.equipment 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

-- Email templates table
CREATE POLICY "Staff can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Everyone can view active email templates" 
ON public.email_templates 
FOR SELECT 
USING (is_active = true);

-- Diet plans table
CREATE POLICY "Staff can manage diet plans" 
ON public.diet_plans 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Members can view own diet plans" 
ON public.diet_plans 
FOR SELECT 
USING (
  created_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM member_diet_plans mdp WHERE mdp.diet_plan_id = id AND mdp.user_id = auth.uid())
);

-- Workout plans table
CREATE POLICY "Staff can manage workout plans" 
ON public.workout_plans 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Members can view own workout plans" 
ON public.workout_plans 
FOR SELECT 
USING (
  created_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM member_workout_plans mwp WHERE mwp.workout_plan_id = id AND mwp.user_id = auth.uid())
);

-- Member diet plans table  
CREATE POLICY "Staff can manage member diet plans" 
ON public.member_diet_plans 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Members can view own diet plans" 
ON public.member_diet_plans 
FOR SELECT 
USING (user_id = auth.uid());

-- Member workout plans table
CREATE POLICY "Staff can manage member workout plans" 
ON public.member_workout_plans 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Members can view own workout plans" 
ON public.member_workout_plans 
FOR SELECT 
USING (user_id = auth.uid());

-- Member measurements table
CREATE POLICY "Staff can manage member measurements" 
ON public.member_measurements 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Members can view own measurements" 
ON public.member_measurements 
FOR SELECT 
USING (
  member_id IN (SELECT id FROM members WHERE user_id = auth.uid()) OR
  is_staff_or_above(auth.uid())
);

-- Member memberships table
CREATE POLICY "Staff can manage member memberships" 
ON public.member_memberships 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Members can view own memberships" 
ON public.member_memberships 
FOR SELECT 
USING (user_id = auth.uid());

-- Invoice items table
CREATE POLICY "Staff can manage invoice items" 
ON public.invoice_items 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

-- Invoices table
CREATE POLICY "Staff can manage invoices" 
ON public.invoices 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Members can view own invoices" 
ON public.invoices 
FOR SELECT 
USING (customer_id = auth.uid());

-- Locker assignments table
CREATE POLICY "Staff can manage locker assignments" 
ON public.locker_assignments 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Members can view own locker assignments" 
ON public.locker_assignments 
FOR SELECT 
USING (
  member_id IN (SELECT id FROM members WHERE user_id = auth.uid()) OR
  is_staff_or_above(auth.uid())
);

-- Locker sizes table
CREATE POLICY "Everyone can view locker sizes" 
ON public.locker_sizes 
FOR SELECT 
USING (true);

CREATE POLICY "Staff can manage locker sizes" 
ON public.locker_sizes 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

-- Lead notes table
CREATE POLICY "Staff can manage lead notes" 
ON public.lead_notes 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

-- Lead tasks table
CREATE POLICY "Staff can manage lead tasks" 
ON public.lead_tasks 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

-- Feedback responses table
CREATE POLICY "Staff can manage feedback responses" 
ON public.feedback_responses 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Users can view public feedback responses" 
ON public.feedback_responses 
FOR SELECT 
USING (is_public = true);

-- Maintenance records table
CREATE POLICY "Staff can manage maintenance records" 
ON public.maintenance_records 
FOR ALL 
USING (is_staff_or_above(auth.uid()));
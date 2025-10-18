-- Add RLS policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create profiles" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- Also add a policy for staff to view profiles
CREATE POLICY "Staff can view all profiles" ON public.profiles
    FOR SELECT USING (is_staff_or_above(auth.uid()));
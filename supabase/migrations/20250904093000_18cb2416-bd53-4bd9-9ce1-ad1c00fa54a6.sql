-- ============================================
-- COMPREHENSIVE MIGRATION: Mock Data to Database
-- ============================================

-- 1. Products and E-commerce Tables
-- ============================================

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    category text NOT NULL,
    image text,
    stock integer DEFAULT 0,
    sku text UNIQUE,
    is_active boolean DEFAULT true,
    branch_id uuid REFERENCES public.branches(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number text UNIQUE NOT NULL DEFAULT generate_order_number(),
    customer_id uuid,
    customer_name text NOT NULL,
    customer_email text,
    subtotal numeric(10,2) NOT NULL DEFAULT 0,
    tax numeric(10,2) NOT NULL DEFAULT 0,
    total numeric(10,2) NOT NULL DEFAULT 0,
    payment_method text NOT NULL,
    payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    order_status text DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed')),
    notes text,
    branch_id uuid REFERENCES public.branches(id),
    created_by uuid REFERENCES public.profiles(user_id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id),
    product_name text NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    unit_price numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Enhanced Trainer System
-- ============================================

CREATE TYPE trainer_status AS ENUM ('active', 'inactive', 'on_leave');
CREATE TYPE trainer_specialty AS ENUM ('strength_training', 'cardio', 'yoga', 'pilates', 'crossfit', 'boxing', 'dance', 'swimming', 'rehabilitation', 'weight_loss', 'bodybuilding', 'martial_arts', 'sports_performance', 'senior_fitness');
CREATE TYPE certification_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

CREATE TABLE public.trainer_profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    employee_id text UNIQUE,
    branch_id uuid REFERENCES public.branches(id),
    
    -- Professional info
    specialties trainer_specialty[] DEFAULT '{}',
    experience integer DEFAULT 0,
    bio text,
    languages text[] DEFAULT '{}',
    
    -- Availability and capacity
    status trainer_status DEFAULT 'active',
    availability jsonb, -- Weekly schedule
    max_clients_per_day integer DEFAULT 8,
    max_clients_per_week integer DEFAULT 40,
    
    -- Pricing
    hourly_rate numeric(10,2),
    package_rates jsonb, -- Array of pricing packages
    
    -- Performance metrics
    rating numeric(3,2) DEFAULT 0,
    total_sessions integer DEFAULT 0,
    total_clients integer DEFAULT 0,
    completion_rate numeric(5,2) DEFAULT 0,
    punctuality_score numeric(5,2) DEFAULT 0,
    
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.trainer_certifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    trainer_id uuid REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    issuing_organization text NOT NULL,
    level certification_level DEFAULT 'intermediate',
    issue_date date,
    expiry_date date,
    verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TYPE assignment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE session_type AS ENUM ('single', 'package', 'trial');
CREATE TYPE assignment_method AS ENUM ('auto', 'manual');

CREATE TABLE public.trainer_assignments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    trainer_id uuid REFERENCES public.trainer_profiles(id),
    member_id uuid REFERENCES public.members(id),
    
    -- Session details
    session_type session_type DEFAULT 'single',
    package_id uuid,
    scheduled_date timestamp with time zone NOT NULL,
    duration integer DEFAULT 60,
    session_notes text,
    
    -- Status and completion
    status assignment_status DEFAULT 'scheduled',
    completed_at timestamp with time zone,
    member_rating integer CHECK (member_rating >= 1 AND member_rating <= 5),
    member_feedback text,
    trainer_notes text,
    
    -- Payment
    is_paid boolean DEFAULT false,
    amount numeric(10,2),
    payment_date timestamp with time zone,
    payment_method text,
    
    -- Assignment metadata
    assigned_by assignment_method DEFAULT 'manual',
    assignment_reason text,
    alternative_trainers uuid[],
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.trainer_change_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid REFERENCES public.members(id),
    current_trainer_id uuid REFERENCES public.trainer_profiles(id),
    requested_trainer_id uuid REFERENCES public.trainer_profiles(id),
    
    reason text NOT NULL,
    description text,
    urgency text DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
    
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approved_by uuid REFERENCES public.profiles(user_id),
    approved_at timestamp with time zone,
    rejection_reason text,
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.trainer_utilization (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    trainer_id uuid REFERENCES public.trainer_profiles(id),
    period text NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
    date date NOT NULL,
    
    -- Time metrics
    total_available_hours integer DEFAULT 0,
    booked_hours integer DEFAULT 0,
    utilization_rate numeric(5,2) DEFAULT 0,
    
    -- Session metrics
    scheduled_sessions integer DEFAULT 0,
    completed_sessions integer DEFAULT 0,
    cancelled_sessions integer DEFAULT 0,
    no_show_sessions integer DEFAULT 0,
    
    -- Financial metrics
    total_revenue numeric(10,2) DEFAULT 0,
    average_session_value numeric(10,2) DEFAULT 0,
    
    -- Quality metrics
    average_rating numeric(3,2) DEFAULT 0,
    punctuality_score numeric(5,2) DEFAULT 0,
    
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Finance System
-- ============================================

CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'cancelled', 'failed');

CREATE TABLE public.transaction_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    type transaction_type NOT NULL,
    color text DEFAULT '#6B7280',
    icon text,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.payment_methods (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('cash', 'card', 'bank_transfer', 'digital_wallet', 'other')),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    date date NOT NULL DEFAULT CURRENT_DATE,
    type transaction_type NOT NULL,
    category_id uuid REFERENCES public.transaction_categories(id),
    amount numeric(10,2) NOT NULL,
    description text NOT NULL,
    payment_method_id uuid REFERENCES public.payment_methods(id),
    reference text,
    
    -- Related entities
    member_id uuid REFERENCES public.members(id),
    branch_id uuid REFERENCES public.branches(id),
    
    status transaction_status DEFAULT 'completed',
    
    created_by uuid REFERENCES public.profiles(user_id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. Lead Management System
-- ============================================

CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
CREATE TYPE lead_source AS ENUM ('website', 'referral', 'social', 'phone', 'walk-in', 'email', 'advertisement');
CREATE TYPE lead_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE task_type AS ENUM ('call', 'email', 'meeting', 'follow_up', 'other');

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    
    status lead_status DEFAULT 'new',
    source lead_source NOT NULL,
    priority lead_priority DEFAULT 'medium',
    
    interested_programs text[],
    message text,
    
    -- Assignment and follow-up
    assigned_to uuid REFERENCES public.profiles(user_id),
    last_contact_date timestamp with time zone,
    next_follow_up_date timestamp with time zone,
    
    -- Conversion tracking
    conversion_date timestamp with time zone,
    referred_by uuid REFERENCES public.profiles(user_id),
    
    estimated_value numeric(10,2),
    tags text[],
    
    branch_id uuid REFERENCES public.branches(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.lead_notes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_by uuid REFERENCES public.profiles(user_id),
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.lead_tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    type task_type DEFAULT 'other',
    priority lead_priority DEFAULT 'medium',
    
    assigned_to uuid REFERENCES public.profiles(user_id),
    due_date timestamp with time zone NOT NULL,
    
    completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    
    created_by uuid REFERENCES public.profiles(user_id),
    created_at timestamp with time zone DEFAULT now()
);

-- 5. Member Progress and Goals
-- ============================================

CREATE TABLE public.member_measurements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid REFERENCES public.members(id) ON DELETE CASCADE,
    
    -- Body measurements
    weight numeric(5,2),
    height numeric(5,2),
    body_fat_percentage numeric(5,2),
    muscle_mass numeric(5,2),
    bmi numeric(5,2),
    
    -- Additional measurements
    chest numeric(5,2),
    waist numeric(5,2),
    hips numeric(5,2),
    arms numeric(5,2),
    thighs numeric(5,2),
    
    -- Vitals
    resting_heart_rate integer,
    blood_pressure_systolic integer,
    blood_pressure_diastolic integer,
    
    notes text,
    measured_by uuid REFERENCES public.profiles(user_id),
    measured_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now()
);

-- 6. Workout Plans System
-- ============================================

CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE plan_status AS ENUM ('draft', 'active', 'archived');

CREATE TABLE public.workout_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    difficulty difficulty_level NOT NULL,
    duration_weeks integer,
    target_goals text[],
    equipment_needed text[],
    
    plan_data jsonb, -- Detailed workout structure
    
    created_by uuid REFERENCES public.profiles(user_id),
    branch_id uuid REFERENCES public.branches(id),
    is_template boolean DEFAULT false,
    status plan_status DEFAULT 'draft',
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_utilization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- ============================================

-- Products policies
CREATE POLICY "Everyone can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Staff can manage products" ON public.products FOR ALL USING (is_staff_or_above(auth.uid()));

-- Orders policies
CREATE POLICY "Staff can manage orders" ON public.orders FOR ALL USING (is_staff_or_above(auth.uid()));
CREATE POLICY "Order items follow order policies" ON public.order_items FOR ALL USING (is_staff_or_above(auth.uid()));

-- Trainer policies
CREATE POLICY "Staff can view trainer profiles" ON public.trainer_profiles FOR SELECT USING (is_staff_or_above(auth.uid()));
CREATE POLICY "Trainers can view own profile" ON public.trainer_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Staff can manage trainer profiles" ON public.trainer_profiles FOR ALL USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Staff can manage trainer certifications" ON public.trainer_certifications FOR ALL USING (is_staff_or_above(auth.uid()));
CREATE POLICY "Staff can manage trainer assignments" ON public.trainer_assignments FOR ALL USING (is_staff_or_above(auth.uid()));
CREATE POLICY "Staff can manage trainer change requests" ON public.trainer_change_requests FOR ALL USING (is_staff_or_above(auth.uid()));
CREATE POLICY "Staff can view trainer utilization" ON public.trainer_utilization FOR SELECT USING (is_staff_or_above(auth.uid()));

-- Finance policies
CREATE POLICY "Staff can view transaction categories" ON public.transaction_categories FOR SELECT USING (is_staff_or_above(auth.uid()));
CREATE POLICY "Admins can manage transaction categories" ON public.transaction_categories FOR ALL USING (is_admin_user(auth.uid()));
CREATE POLICY "Staff can view payment methods" ON public.payment_methods FOR SELECT USING (is_staff_or_above(auth.uid()));
CREATE POLICY "Admins can manage payment methods" ON public.payment_methods FOR ALL USING (is_admin_user(auth.uid()));
CREATE POLICY "Staff can manage transactions" ON public.transactions FOR ALL USING (is_staff_or_above(auth.uid()));

-- Lead policies
CREATE POLICY "Staff can manage leads" ON public.leads FOR ALL USING (is_staff_or_above(auth.uid()));
CREATE POLICY "Staff can manage lead notes" ON public.lead_notes FOR ALL USING (is_staff_or_above(auth.uid()));
CREATE POLICY "Staff can manage lead tasks" ON public.lead_tasks FOR ALL USING (is_staff_or_above(auth.uid()));

-- Member measurement policies
CREATE POLICY "Staff can manage measurements" ON public.member_measurements FOR ALL USING (is_staff_or_above(auth.uid()));
CREATE POLICY "Members can view own measurements" ON public.member_measurements 
    FOR SELECT USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

-- Workout plan policies
CREATE POLICY "Staff can manage workout plans" ON public.workout_plans FOR ALL USING (is_staff_or_above(auth.uid()));
CREATE POLICY "Everyone can view active workout templates" ON public.workout_plans 
    FOR SELECT USING (is_template = true AND status = 'active');

-- Insert default categories and payment methods
-- ============================================

INSERT INTO public.transaction_categories (name, type, color, icon, description) VALUES
    ('Membership Fees', 'income', '#10B981', 'Users', 'Monthly and yearly membership fees'),
    ('Personal Training', 'income', '#8B5CF6', 'Dumbbell', 'Personal training sessions'),
    ('Classes', 'income', '#F59E0B', 'Calendar', 'Group fitness classes'),
    ('Product Sales', 'income', '#EF4444', 'Package', 'Supplements and merchandise'),
    ('Registration Fees', 'income', '#06B6D4', 'UserPlus', 'New member registration fees'),
    ('Equipment', 'expense', '#DC2626', 'Dumbbell', 'Gym equipment purchases and maintenance'),
    ('Rent', 'expense', '#7C2D12', 'Building', 'Monthly rent payments'),
    ('Utilities', 'expense', '#1F2937', 'Zap', 'Electricity, water, internet'),
    ('Staff Salaries', 'expense', '#374151', 'Users', 'Employee salaries and benefits'),
    ('Marketing', 'expense', '#9333EA', 'Megaphone', 'Advertising and promotional expenses'),
    ('Supplies', 'expense', '#059669', 'Package', 'Cleaning supplies, towels, etc.'),
    ('Insurance', 'expense', '#0369A1', 'Shield', 'Business insurance premiums');

INSERT INTO public.payment_methods (name, type) VALUES
    ('Cash', 'cash'),
    ('Credit Card', 'card'),
    ('Debit Card', 'card'),
    ('Bank Transfer', 'bank_transfer'),
    ('PayPal', 'digital_wallet'),
    ('Stripe', 'digital_wallet'),
    ('Check', 'other');

-- Create triggers for updated_at fields
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainer_profiles_updated_at BEFORE UPDATE ON public.trainer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainer_assignments_updated_at BEFORE UPDATE ON public.trainer_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainer_change_requests_updated_at BEFORE UPDATE ON public.trainer_change_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON public.workout_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
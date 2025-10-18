-- Create enum types first
CREATE TYPE public.user_role AS ENUM ('super-admin', 'admin', 'team', 'member');
CREATE TYPE public.team_role AS ENUM ('manager', 'trainer', 'staff');
CREATE TYPE public.gender AS ENUM ('male', 'female', 'other', 'prefer-not-to-say');
CREATE TYPE public.government_id_type AS ENUM ('aadhaar', 'pan', 'passport', 'voter-id');
CREATE TYPE public.membership_status AS ENUM ('active', 'expired', 'not-assigned');
CREATE TYPE public.class_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE public.class_recurrence AS ENUM ('none', 'daily', 'weekly', 'monthly');
CREATE TYPE public.class_tag AS ENUM ('strength', 'cardio', 'flexibility', 'dance', 'martial-arts', 'water', 'mind-body');
CREATE TYPE public.trainer_specialty AS ENUM ('strength_training', 'cardio', 'yoga', 'pilates', 'crossfit', 'martial_arts', 'dance', 'swimming', 'rehabilitation', 'nutrition', 'weight_loss', 'bodybuilding', 'sports_performance', 'senior_fitness', 'youth_fitness');
CREATE TYPE public.trainer_status AS ENUM ('active', 'inactive', 'on_leave', 'busy');
CREATE TYPE public.certification_level AS ENUM ('basic', 'intermediate', 'advanced', 'expert');
CREATE TYPE public.feedback_type AS ENUM ('facility', 'trainer', 'class', 'equipment', 'service', 'general');
CREATE TYPE public.feedback_status AS ENUM ('pending', 'in-review', 'resolved', 'closed');
CREATE TYPE public.feedback_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
CREATE TYPE public.lead_source AS ENUM ('website', 'referral', 'social', 'walk-in', 'phone', 'email', 'event');
CREATE TYPE public.lead_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.locker_status AS ENUM ('available', 'occupied', 'maintenance', 'reserved');
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');
CREATE TYPE public.payment_method_type AS ENUM ('cash', 'card', 'bank_transfer', 'digital_wallet', 'other');
CREATE TYPE public.transaction_status AS ENUM ('completed', 'pending', 'cancelled');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.attendance_status AS ENUM ('checked-in', 'checked-out', 'no-show', 'late');
CREATE TYPE public.entry_method AS ENUM ('biometric', 'manual', 'card', 'mobile');
CREATE TYPE public.device_status AS ENUM ('online', 'offline', 'maintenance');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  role public.user_role NOT NULL DEFAULT 'member',
  team_role public.team_role,
  branch_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for RBAC
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  branch_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, branch_id)
);

-- Create branches table
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address JSONB NOT NULL,
  contact JSONB NOT NULL,
  hours JSONB NOT NULL,
  amenities TEXT[],
  images TEXT[],
  status TEXT NOT NULL DEFAULT 'active',
  capacity INTEGER NOT NULL DEFAULT 0,
  current_members INTEGER NOT NULL DEFAULT 0,
  manager_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create members table
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  date_of_birth DATE,
  gender public.gender,
  address JSONB,
  government_id JSONB,
  measurements JSONB,
  emergency_contact JSONB,
  profile_photo TEXT,
  branch_id UUID REFERENCES public.branches(id),
  membership_status public.membership_status DEFAULT 'not-assigned',
  membership_plan TEXT,
  trainer_id UUID,
  joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trainer_profiles table
CREATE TABLE public.trainer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL UNIQUE,
  branch_id UUID REFERENCES public.branches(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  date_of_birth DATE,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  specialties public.trainer_specialty[],
  experience INTEGER DEFAULT 0,
  bio TEXT,
  languages TEXT[],
  status public.trainer_status DEFAULT 'active',
  max_clients_per_day INTEGER DEFAULT 10,
  max_clients_per_week INTEGER DEFAULT 50,
  hourly_rate NUMERIC(10,2) DEFAULT 0,
  package_rates JSONB,
  rating NUMERIC(3,2) DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  completion_rate NUMERIC(5,2) DEFAULT 0,
  punctuality_score NUMERIC(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trainer_availability table
CREATE TABLE public.trainer_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trainer_id, day_of_week)
);

-- Create trainer_certifications table
CREATE TABLE public.trainer_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  level public.certification_level NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gym_classes table
CREATE TABLE public.gym_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  recurrence public.class_recurrence DEFAULT 'none',
  trainer_id UUID REFERENCES public.trainer_profiles(id),
  branch_id UUID REFERENCES public.branches(id),
  capacity INTEGER NOT NULL DEFAULT 20,
  enrolled_count INTEGER DEFAULT 0,
  tags public.class_tag[],
  status public.class_status DEFAULT 'scheduled',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create class_enrollments table
CREATE TABLE public.class_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.gym_classes(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'enrolled',
  notes TEXT,
  UNIQUE(class_id, member_id)
);

-- Create attendance_records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  branch_id UUID REFERENCES public.branches(id),
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out_time TIMESTAMP WITH TIME ZONE,
  entry_method public.entry_method DEFAULT 'manual',
  device_id UUID,
  device_location TEXT,
  status public.attendance_status DEFAULT 'checked-in',
  notes TEXT,
  duration INTEGER,
  is_late BOOLEAN DEFAULT false,
  expected_check_in TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  location JSONB,
  work_shift_id UUID,
  membership_id UUID,
  class_id UUID REFERENCES public.gym_classes(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create biometric_devices table
CREATE TABLE public.biometric_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT,
  ip_address INET,
  location TEXT,
  branch_id UUID REFERENCES public.branches(id),
  status public.device_status DEFAULT 'offline',
  last_sync TIMESTAMP WITH TIME ZONE,
  total_records INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work_shifts table
CREATE TABLE public.work_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  branch_id UUID REFERENCES public.branches(id),
  days TEXT[],
  user_ids UUID[],
  is_active BOOLEAN DEFAULT true,
  grace_period INTEGER DEFAULT 15,
  late_threshold INTEGER DEFAULT 30,
  break_duration INTEGER DEFAULT 60,
  minimum_hours NUMERIC(4,2) DEFAULT 8,
  maximum_hours NUMERIC(4,2) DEFAULT 12,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id),
  user_id UUID REFERENCES auth.users(id),
  type public.feedback_type NOT NULL,
  category TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status public.feedback_status DEFAULT 'pending',
  priority public.feedback_priority DEFAULT 'medium',
  branch_id UUID REFERENCES public.branches(id),
  related_entity_id UUID,
  related_entity_name TEXT,
  attachments TEXT[],
  tags TEXT[],
  is_anonymous BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback_responses table
CREATE TABLE public.feedback_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL,
  responder_name TEXT NOT NULL,
  responder_role TEXT NOT NULL,
  message TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status public.lead_status DEFAULT 'new',
  source public.lead_source NOT NULL,
  priority public.lead_priority DEFAULT 'medium',
  interested_programs TEXT[],
  message TEXT,
  assigned_to UUID,
  last_contact_date TIMESTAMP WITH TIME ZONE,
  next_follow_up_date TIMESTAMP WITH TIME ZONE,
  referred_by UUID,
  conversion_date TIMESTAMP WITH TIME ZONE,
  estimated_value NUMERIC(10,2),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead_notes table
CREATE TABLE public.lead_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead_tasks table
CREATE TABLE public.lead_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  priority public.lead_priority DEFAULT 'medium',
  type TEXT DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create locker_sizes table
CREATE TABLE public.locker_sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  monthly_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lockers table
CREATE TABLE public.lockers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  number TEXT NOT NULL,
  branch_id UUID REFERENCES public.branches(id),
  size_id UUID REFERENCES public.locker_sizes(id),
  status public.locker_status DEFAULT 'available',
  assigned_member_id UUID REFERENCES public.members(id),
  assigned_date DATE,
  expiration_date DATE,
  release_date DATE,
  monthly_fee NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(branch_id, number)
);

-- Create locker_assignments table
CREATE TABLE public.locker_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  locker_id UUID NOT NULL REFERENCES public.lockers(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiration_date DATE,
  release_date DATE,
  monthly_fee NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transaction_categories table
CREATE TABLE public.transaction_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type public.transaction_type NOT NULL,
  color TEXT DEFAULT '#000000',
  icon TEXT DEFAULT 'circle',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_methods table
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type public.payment_method_type NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type public.transaction_type NOT NULL,
  category_id UUID REFERENCES public.transaction_categories(id),
  amount NUMERIC(12,2) NOT NULL,
  description TEXT NOT NULL,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  reference TEXT,
  member_id UUID REFERENCES public.members(id),
  status public.transaction_status DEFAULT 'completed',
  branch_id UUID REFERENCES public.branches(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  customer_id UUID REFERENCES public.members(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  status public.invoice_status DEFAULT 'draft',
  notes TEXT,
  branch_id UUID REFERENCES public.branches(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meals table
CREATE TABLE public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- breakfast, lunch, dinner, snack
  calories_per_serving NUMERIC(8,2),
  protein NUMERIC(6,2),
  carbs NUMERIC(6,2),
  fat NUMERIC(6,2),
  fiber NUMERIC(6,2),
  ingredients TEXT[],
  preparation_time INTEGER, -- minutes
  cooking_time INTEGER, -- minutes
  instructions TEXT[],
  dietary_tags TEXT[],
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercises table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  muscle_groups TEXT[],
  equipment TEXT[],
  difficulty_level TEXT DEFAULT 'beginner',
  instructions TEXT[],
  tips TEXT[],
  image_url TEXT,
  video_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create diet_plans table
CREATE TABLE public.diet_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT, -- weight_loss, muscle_gain, maintenance
  duration_weeks INTEGER NOT NULL,
  daily_calories INTEGER,
  meal_ids UUID[],
  created_by UUID,
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout_plans table
CREATE TABLE public.workout_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT, -- strength, endurance, flexibility, weight_loss
  difficulty_level TEXT DEFAULT 'beginner',
  duration_weeks INTEGER NOT NULL,
  workouts_per_week INTEGER DEFAULT 3,
  created_by UUID,
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout_sets table
CREATE TABLE public.workout_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id),
  day_number INTEGER NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight NUMERIC(6,2),
  duration INTEGER, -- seconds
  rest_duration INTEGER, -- seconds
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create member_plan_assignments table
CREATE TABLE public.member_plan_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  diet_plan_id UUID REFERENCES public.diet_plans(id),
  workout_plan_id UUID REFERENCES public.workout_plans(id),
  assigned_by UUID NOT NULL,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_insights table
CREATE TABLE public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id),
  type TEXT NOT NULL, -- diet, workout, progress
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  recommendations TEXT[],
  confidence_score NUMERIC(3,2),
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trainer_assignments table
CREATE TABLE public.trainer_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id),
  member_id UUID NOT NULL REFERENCES public.members(id),
  session_type TEXT DEFAULT 'single',
  package_id UUID,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60, -- minutes
  session_specialty public.trainer_specialty,
  notes TEXT,
  status TEXT DEFAULT 'scheduled',
  completed_at TIMESTAMP WITH TIME ZONE,
  member_rating INTEGER CHECK (member_rating >= 1 AND member_rating <= 5),
  member_feedback TEXT,
  trainer_notes TEXT,
  is_paid BOOLEAN DEFAULT false,
  amount NUMERIC(10,2),
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  assigned_by TEXT DEFAULT 'manual',
  assignment_reason TEXT,
  alternative_trainers UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trainer_change_requests table
CREATE TABLE public.trainer_change_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id),
  current_trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id),
  requested_trainer_id UUID REFERENCES public.trainer_profiles(id),
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  new_trainer_id UUID REFERENCES public.trainer_profiles(id),
  reassignment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trainer_utilization table
CREATE TABLE public.trainer_utilization (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id),
  period TEXT NOT NULL, -- daily, weekly, monthly
  date DATE NOT NULL,
  total_available_hours NUMERIC(6,2) DEFAULT 0,
  booked_hours NUMERIC(6,2) DEFAULT 0,
  utilization_rate NUMERIC(5,2) DEFAULT 0,
  scheduled_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  cancelled_sessions INTEGER DEFAULT 0,
  no_show_sessions INTEGER DEFAULT 0,
  total_revenue NUMERIC(12,2) DEFAULT 0,
  average_session_value NUMERIC(10,2) DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  punctuality_score NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trainer_id, period, date)
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role public.team_role NOT NULL,
  department TEXT,
  branch_id UUID REFERENCES public.branches(id),
  manager_id UUID,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  salary NUMERIC(12,2),
  emergency_contact JSONB,
  skills TEXT[],
  certifications TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locker_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locker_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_plan_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_utilization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
-- Equipment Management
CREATE TABLE equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  brand text,
  model text,
  serial_number text UNIQUE,
  purchase_date date,
  warranty_expiry date,
  status equipment_status DEFAULT 'operational',
  condition equipment_condition DEFAULT 'good',
  location text,
  branch_id uuid REFERENCES branches(id),
  purchase_price numeric(10,2),
  current_value numeric(10,2),
  maintenance_schedule jsonb,
  specifications jsonb,
  images text[],
  notes text,
  last_maintenance_date date,
  next_maintenance_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  type maintenance_type NOT NULL,
  status maintenance_status DEFAULT 'pending',
  scheduled_date timestamp with time zone NOT NULL,
  completed_date timestamp with time zone,
  technician_id uuid REFERENCES profiles(user_id),
  description text NOT NULL,
  cost numeric(10,2),
  parts_used jsonb,
  notes text,
  before_photos text[],
  after_photos text[],
  created_by uuid REFERENCES profiles(user_id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Diet & Workout Plans
CREATE TABLE diet_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  difficulty plan_difficulty NOT NULL,
  status plan_status DEFAULT 'active',
  duration_weeks integer,
  target_goals text[],
  dietary_restrictions text[],
  calorie_target integer,
  macros jsonb,
  meal_plan jsonb,
  created_by uuid REFERENCES profiles(user_id),
  branch_id uuid REFERENCES branches(id),
  is_template boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  difficulty plan_difficulty NOT NULL,
  status plan_status DEFAULT 'active',
  duration_weeks integer,
  target_goals text[],
  equipment_needed text[],
  exercises jsonb,
  created_by uuid REFERENCES profiles(user_id),
  branch_id uuid REFERENCES branches(id),
  is_template boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE member_diet_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id),
  diet_plan_id uuid NOT NULL REFERENCES diet_plans(id),
  assigned_by uuid REFERENCES profiles(user_id),
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  progress jsonb,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE member_workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id),
  workout_plan_id uuid NOT NULL REFERENCES workout_plans(id),
  assigned_by uuid REFERENCES profiles(user_id),
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  progress jsonb,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Team Management
CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id),
  employee_id text NOT NULL UNIQUE,
  department text NOT NULL,
  position text NOT NULL,
  employment_type employment_type DEFAULT 'full_time',
  hire_date date NOT NULL DEFAULT CURRENT_DATE,
  salary numeric(10,2),
  hourly_rate numeric(8,2),
  branch_id uuid REFERENCES branches(id),
  manager_id uuid REFERENCES profiles(user_id),
  skills text[],
  certifications text[],
  performance_rating numeric(3,2) CHECK (performance_rating >= 0 AND performance_rating <= 5),
  last_review_date date,
  next_review_date date,
  emergency_contact jsonb,
  bank_details jsonb,
  documents jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Trainer Assignments & Bookings
CREATE TABLE trainer_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES trainer_profiles(user_id),
  member_id uuid NOT NULL REFERENCES profiles(user_id),
  session_type session_type DEFAULT 'personal_training',
  scheduled_date timestamp with time zone NOT NULL,
  duration_minutes integer DEFAULT 60,
  status assignment_status DEFAULT 'scheduled',
  location text,
  notes text,
  member_goals text[],
  session_plan jsonb,
  completed_exercises jsonb,
  member_feedback text,
  trainer_notes text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_by uuid REFERENCES profiles(user_id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE trainer_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES trainer_profiles(user_id),
  member_id uuid NOT NULL REFERENCES profiles(user_id),
  package_name text NOT NULL,
  total_sessions integer NOT NULL,
  used_sessions integer DEFAULT 0,
  price_per_session numeric(8,2) NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  status package_status DEFAULT 'active',
  purchase_date date DEFAULT CURRENT_DATE,
  expiry_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- System Configuration
CREATE TABLE system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  category text NOT NULL,
  description text,
  is_encrypted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type email_template_type NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  variables jsonb,
  is_active boolean DEFAULT true,
  branch_id uuid REFERENCES branches(id),
  created_by uuid REFERENCES profiles(user_id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type sms_template_type NOT NULL,
  content text NOT NULL,
  variables jsonb,
  is_active boolean DEFAULT true,
  branch_id uuid REFERENCES branches(id),
  created_by uuid REFERENCES profiles(user_id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
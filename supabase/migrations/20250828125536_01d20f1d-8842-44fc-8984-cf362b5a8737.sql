-- Phase 3: Analytics & Reporting Infrastructure
-- Analytics tables for comprehensive reporting

CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  event_category text NOT NULL,
  user_id uuid REFERENCES profiles(user_id),
  session_id text,
  properties jsonb DEFAULT '{}',
  branch_id uuid REFERENCES branches(id),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE member_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id),
  month_year date NOT NULL, -- First day of month for grouping
  check_ins_count integer DEFAULT 0,
  classes_attended integer DEFAULT 0,
  personal_training_sessions integer DEFAULT 0,
  revenue_generated numeric(10,2) DEFAULT 0,
  referrals_made integer DEFAULT 0,
  feedback_submitted integer DEFAULT 0,
  avg_session_duration integer DEFAULT 0, -- in minutes
  favorite_workout_type text,
  peak_usage_hours integer[], -- Array of hours (0-23)
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, month_year)
);

CREATE TABLE branch_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES branches(id),
  month_year date NOT NULL,
  total_members integer DEFAULT 0,
  new_members integer DEFAULT 0,
  churned_members integer DEFAULT 0,
  total_revenue numeric(10,2) DEFAULT 0,
  membership_revenue numeric(10,2) DEFAULT 0,
  training_revenue numeric(10,2) DEFAULT 0,
  retail_revenue numeric(10,2) DEFAULT 0,
  total_check_ins integer DEFAULT 0,
  peak_capacity_usage numeric(5,2) DEFAULT 0, -- Percentage
  equipment_utilization numeric(5,2) DEFAULT 0, -- Percentage  
  trainer_utilization numeric(5,2) DEFAULT 0, -- Percentage
  member_satisfaction_avg numeric(3,2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(branch_id, month_year)
);

CREATE TABLE trainer_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
  trainer_id uuid NOT NULL REFERENCES trainer_profiles(user_id),
  month_year date NOT NULL,
  sessions_conducted integer DEFAULT 0,
  total_revenue numeric(10,2) DEFAULT 0,
  avg_session_rating numeric(3,2) DEFAULT 0,
  members_trained integer DEFAULT 0,
  new_members_acquired integer DEFAULT 0,
  retention_rate numeric(5,2) DEFAULT 0, -- Percentage
  cancellation_rate numeric(5,2) DEFAULT 0, -- Percentage
  punctuality_score numeric(3,2) DEFAULT 0,
  specialties_demand jsonb DEFAULT '{}', -- {specialty: demand_count}
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(trainer_id, month_year)
);

-- Equipment analytics for maintenance and usage optimization
CREATE TABLE equipment_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES equipment(id),
  month_year date NOT NULL,
  usage_hours integer DEFAULT 0,
  maintenance_cost numeric(8,2) DEFAULT 0,
  downtime_hours integer DEFAULT 0,
  utilization_rate numeric(5,2) DEFAULT 0, -- Percentage
  member_satisfaction numeric(3,2) DEFAULT 0,
  repair_incidents integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(equipment_id, month_year)
);

-- Real-time dashboard metrics
CREATE TABLE dashboard_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES branches(id),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(branch_id, metric_name, metric_date)
);

-- Phase 5: Advanced Features  
-- AI Insights and Recommendations
CREATE TABLE ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(user_id),
  branch_id uuid REFERENCES branches(id),
  insight_type text NOT NULL, -- 'workout_recommendation', 'diet_suggestion', 'goal_prediction', etc.
  title text NOT NULL,
  description text NOT NULL,
  confidence_score numeric(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  data_sources text[], -- Which data was used to generate insight
  recommendation_data jsonb,
  is_applied boolean DEFAULT false,
  applied_at timestamp with time zone,
  effectiveness_score numeric(3,2), -- User feedback on usefulness
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Member goal tracking with progress photos
CREATE TABLE progress_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id),
  goal_id uuid REFERENCES member_goals(id),
  photo_url text NOT NULL,
  photo_type text DEFAULT 'progress', -- 'before', 'progress', 'after'
  measurements jsonb, -- Associated body measurements
  notes text,
  is_public boolean DEFAULT false,
  taken_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now()
);

-- Member achievements and badges
CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL, -- 'fitness', 'consistency', 'social', 'milestone'
  icon_url text,
  criteria jsonb NOT NULL, -- Conditions to earn achievement
  points_value integer DEFAULT 0,
  rarity text DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE member_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id),
  achievement_id uuid NOT NULL REFERENCES achievements(id),
  earned_date date DEFAULT CURRENT_DATE,
  progress_data jsonb, -- How they earned it
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Notification preferences and queue
CREATE TABLE notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id),
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  push_notifications boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  workout_reminders boolean DEFAULT true,
  class_reminders boolean DEFAULT true,
  payment_reminders boolean DEFAULT true,
  achievement_notifications boolean DEFAULT true,
  social_notifications boolean DEFAULT false,
  preferred_contact_time_start time DEFAULT '09:00',
  preferred_contact_time_end time DEFAULT '18:00',
  timezone text DEFAULT 'UTC',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on all new tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
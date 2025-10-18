-- Create system_settings table for storing all system configuration
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('general', 'security', 'database', 'notifications', 'backup', 'subscription')),
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(category, key)
);

-- Create whatsapp_templates table
CREATE TABLE public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('membership', 'classes', 'payments', 'appointments', 'promotions', 'reminders', 'alerts', 'welcome', 'system')),
  event TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'text' CHECK (template_type IN ('text', 'media', 'interactive')),
  header_text TEXT,
  body_text TEXT NOT NULL,
  footer_text TEXT,
  buttons JSONB DEFAULT '[]',
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'en',
  whatsapp_template_id TEXT, -- WhatsApp Business API template ID
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  branch_id UUID REFERENCES branches(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create system_backups table
CREATE TABLE public.system_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'schema', 'data')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  file_path TEXT,
  file_size BIGINT,
  compression_type TEXT DEFAULT 'gzip',
  backup_data JSONB DEFAULT '{}', -- metadata about what was backed up
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retention_until TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'annually')),
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}', -- max_branches, max_trainers, max_members, etc.
  is_active BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create system_events table for real system health monitoring
CREATE TABLE public.system_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('info', 'warning', 'error', 'success')),
  event_category TEXT NOT NULL CHECK (event_category IN ('system', 'database', 'backup', 'security', 'performance', 'user_activity')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  severity INTEGER DEFAULT 1 CHECK (severity BETWEEN 1 AND 5), -- 1=info, 5=critical
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_settings
CREATE POLICY "Super admins can manage system settings" ON public.system_settings
  FOR ALL USING (get_user_role(auth.uid()) = 'super-admin');

-- RLS Policies for whatsapp_templates
CREATE POLICY "Staff can manage whatsapp templates" ON public.whatsapp_templates
  FOR ALL USING (is_staff_or_above(auth.uid()));

-- RLS Policies for system_backups
CREATE POLICY "Super admins can manage backups" ON public.system_backups
  FOR ALL USING (get_user_role(auth.uid()) = 'super-admin');

-- RLS Policies for subscription_plans
CREATE POLICY "Super admins can manage subscription plans" ON public.subscription_plans
  FOR ALL USING (get_user_role(auth.uid()) = 'super-admin');

CREATE POLICY "Everyone can view active subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- RLS Policies for system_events
CREATE POLICY "Super admins can manage system events" ON public.system_events
  FOR ALL USING (get_user_role(auth.uid()) = 'super-admin');

CREATE POLICY "Staff can view system events" ON public.system_events
  FOR SELECT USING (is_staff_or_above(auth.uid()));

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price, billing_cycle, features, limits) VALUES
('Starter', 'Perfect for small gyms getting started', 29.99, 'monthly', 
 '{"branches": 1, "staff_management": true, "basic_reporting": true, "email_support": true}',
 '{"max_branches": 1, "max_trainers": 3, "max_members": 100, "api_calls_per_month": 1000}'),
('Professional', 'Ideal for growing gym businesses', 79.99, 'monthly',
 '{"branches": 3, "staff_management": true, "advanced_reporting": true, "sms_notifications": true, "priority_support": true}',
 '{"max_branches": 3, "max_trainers": 10, "max_members": 500, "api_calls_per_month": 5000}'),
('Enterprise', 'For large gym chains and franchises', 199.99, 'monthly',
 '{"branches": -1, "staff_management": true, "advanced_reporting": true, "custom_branding": true, "api_access": true, "dedicated_support": true}',
 '{"max_branches": -1, "max_trainers": -1, "max_members": -1, "api_calls_per_month": -1}');

-- Insert default system settings
INSERT INTO public.system_settings (category, key, value, description) VALUES
('general', 'app_name', '"GymFit Pro"', 'Application name displayed across the platform'),
('general', 'company_name', '"GymFit Corporation"', 'Company name for branding and legal purposes'),
('general', 'default_timezone', '"UTC"', 'Default timezone for system operations'),
('general', 'default_currency', '"USD"', 'Default currency for pricing and transactions'),
('general', 'maintenance_mode', 'false', 'Enable maintenance mode to block user access'),
('general', 'allow_registration', 'true', 'Allow new user registrations'),
('security', 'require_2fa', 'false', 'Force all users to enable two-factor authentication'),
('security', 'auto_logout', 'true', 'Automatically log users out after inactivity'),
('security', 'strong_password_policy', 'true', 'Enforce strong password requirements'),
('security', 'session_duration_hours', '8', 'Session duration in hours'),
('security', 'max_login_attempts', '5', 'Maximum failed login attempts before lockout'),
('database', 'auto_backup', 'true', 'Enable automatic database backups'),
('database', 'backup_compression', 'true', 'Compress backup files to save space'),
('database', 'backup_frequency', '"daily"', 'Backup frequency schedule'),
('database', 'retention_days', '30', 'Backup retention period in days'),
('notifications', 'email_notifications', 'true', 'Send system alerts via email'),
('notifications', 'sms_notifications', 'false', 'Send critical alerts via SMS'),
('notifications', 'admin_email', '"admin@gymfit.com"', 'Admin email for system notifications');

-- Create trigger for updating system_settings timestamps
CREATE OR REPLACE FUNCTION update_system_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_settings_timestamp
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_timestamp();
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
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whatsapp_templates
CREATE POLICY "Staff can manage whatsapp templates" ON public.whatsapp_templates
  FOR ALL USING (is_staff_or_above(auth.uid()));

-- RLS Policies for system_backups
CREATE POLICY "Super admins can manage backups" ON public.system_backups
  FOR ALL USING (get_user_role(auth.uid()) = 'super-admin');

-- RLS Policies for system_events
CREATE POLICY "Super admins can manage system events" ON public.system_events
  FOR ALL USING (get_user_role(auth.uid()) = 'super-admin');

CREATE POLICY "Staff can view system events" ON public.system_events
  FOR SELECT USING (is_staff_or_above(auth.uid()));

-- Insert some sample system events for real system health
INSERT INTO public.system_events (event_type, event_category, title, description, metadata, severity) VALUES
('success', 'database', 'Database backup completed successfully', 'Scheduled database backup completed without errors', '{"backup_size": "124.5MB", "duration": "2.3s"}', 1),
('warning', 'performance', 'High CPU usage detected', 'CPU usage has exceeded 80% for the last 5 minutes', '{"cpu_usage": 85.3, "server": "main-db"}', 3),
('info', 'system', 'System maintenance completed', 'Scheduled maintenance window completed successfully', '{"maintenance_type": "security_updates", "downtime": "0s"}', 1),
('info', 'user_activity', 'New user registration spike detected', 'Unusual increase in user registrations in the last hour', '{"new_registrations": 15, "normal_rate": 3}', 2);
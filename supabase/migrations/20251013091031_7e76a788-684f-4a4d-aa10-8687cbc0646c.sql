-- Create roles table with metadata
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  is_system BOOLEAN DEFAULT false,
  scope TEXT DEFAULT 'branch' CHECK (scope IN ('global', 'branch', 'self')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  module TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('read', 'write', 'create', 'delete')),
  is_system BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(role_id, permission_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON public.permissions(category);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions(permission_id);

-- Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permissions table
CREATE POLICY "Everyone can view permissions"
  ON public.permissions FOR SELECT
  USING (true);

CREATE POLICY "Only super-admins can manage permissions"
  ON public.permissions FOR ALL
  USING (is_super_admin(auth.uid()));

-- RLS Policies for roles table
CREATE POLICY "Everyone can view roles"
  ON public.roles FOR SELECT
  USING (true);

CREATE POLICY "Only super-admins can create roles"
  ON public.roles FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()) AND is_system = false);

CREATE POLICY "Only super-admins can update non-system roles"
  ON public.roles FOR UPDATE
  USING (is_super_admin(auth.uid()) AND is_system = false);

CREATE POLICY "Only super-admins can delete non-system roles"
  ON public.roles FOR DELETE
  USING (is_super_admin(auth.uid()) AND is_system = false);

-- RLS Policies for role_permissions
CREATE POLICY "Everyone can view role permissions"
  ON public.role_permissions FOR SELECT
  USING (true);

CREATE POLICY "Only super-admins can manage role permissions"
  ON public.role_permissions FOR ALL
  USING (is_super_admin(auth.uid()));

-- Seed system roles
INSERT INTO public.roles (name, display_name, description, color, is_system, scope) VALUES
('super-admin', 'Super Administrator', 'Platform owner with SaaS management access', '#dc2626', true, 'global'),
('admin', 'Administrator', 'Full gym operational access', '#ea580c', true, 'global'),
('team-manager', 'Team Manager', 'Branch management and oversight', '#0ea5e9', true, 'branch'),
('team-trainer', 'Team Trainer', 'Trainer-specific access', '#16a34a', true, 'branch'),
('team-staff', 'Team Staff', 'Front desk operations', '#7c3aed', true, 'branch'),
('member', 'Member', 'Basic member access', '#dc2626', true, 'self')
ON CONFLICT (name) DO NOTHING;
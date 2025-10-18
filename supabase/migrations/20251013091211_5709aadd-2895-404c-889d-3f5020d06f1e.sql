-- Link permissions to roles based on the original mockRoles configuration

-- Super Admin permissions
WITH super_admin_role AS (
  SELECT id FROM public.roles WHERE name = 'super-admin'
),
super_admin_perms AS (
  SELECT id FROM public.permissions WHERE name IN (
    'system.view', 'system.manage', 'system.backup', 'system.restore',
    'users.view', 'users.create', 'users.edit', 'users.delete', 'users.export',
    'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
    'analytics.view', 'reports.view', 'reports.export',
    'settings.view', 'settings.edit',
    'notifications.view', 'notifications.send',
    'sms.providers.create', 'sms.providers.edit', 'sms.providers.delete'
  )
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT super_admin_role.id, super_admin_perms.id
FROM super_admin_role, super_admin_perms
ON CONFLICT DO NOTHING;

-- Admin permissions
WITH admin_role AS (
  SELECT id FROM public.roles WHERE name = 'admin'
),
admin_perms AS (
  SELECT id FROM public.permissions WHERE name IN (
    'branches.view', 'branches.create', 'branches.edit', 'branches.delete',
    'users.view', 'users.create', 'users.edit', 'users.export',
    'members.view', 'members.create', 'members.edit', 'members.delete', 'members.export',
    'team.view', 'team.create', 'team.edit', 'team.delete',
    'classes.view', 'classes.create', 'classes.edit', 'classes.delete', 'classes.schedule',
    'equipment.view', 'equipment.create', 'equipment.edit', 'equipment.delete',
    'lockers.view', 'lockers.create', 'lockers.edit', 'lockers.delete', 'lockers.assign', 'lockers.release',
    'finance.view', 'finance.create', 'finance.edit', 'finance.process',
    'analytics.view', 'reports.view', 'reports.export',
    'settings.view', 'settings.edit',
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'pos.view', 'pos.process',
    'leads.view', 'leads.create', 'leads.edit', 'leads.delete', 'leads.assign', 'leads.export',
    'referrals.view', 'referrals.create', 'referrals.edit', 'referrals.process',
    'feedback.view', 'feedback.create', 'feedback.edit', 'feedback.delete', 'feedback.respond',
    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign',
    'diet-workout.view', 'diet-workout.create', 'diet-workout.edit', 'diet-workout.assign',
    'notifications.view', 'notifications.send',
    'sms.view', 'sms.send', 'sms.templates.view', 'sms.templates.create', 'sms.templates.edit', 'sms.templates.delete',
    'sms.settings.view', 'sms.settings.edit', 'sms.providers.view',
    'sms.logs.view', 'sms.logs.export', 'sms.analytics.view',
    'trainer.schedule.view', 'trainer.schedule.manage', 'trainer.clients.view', 'trainer.clients.manage',
    'trainer.workouts.create', 'trainer.workouts.assign', 'trainer.progress.track', 'trainer.earnings.view',
    'staff.checkin.process', 'staff.support.handle', 'staff.orientation.conduct', 'staff.maintenance.report',
    'attendance.view', 'attendance.create', 'attendance.edit', 'attendance.delete', 'attendance.export',
    'attendance.checkin.manual', 'attendance.checkout.manual', 'attendance.approve', 'attendance.reports.view',
    'devices.view', 'devices.create', 'devices.edit', 'devices.delete', 'devices.sync', 'devices.settings',
    'devices.maintenance', 'devices.restart', 'devices.logs.view'
  )
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT admin_role.id, admin_perms.id
FROM admin_role, admin_perms
ON CONFLICT DO NOTHING;

-- Team Manager permissions
WITH manager_role AS (
  SELECT id FROM public.roles WHERE name = 'team-manager'
),
manager_perms AS (
  SELECT id FROM public.permissions WHERE name IN (
    'members.view', 'members.create', 'members.edit', 'members.export',
    'team.view', 'team.create', 'team.edit',
    'classes.view', 'classes.create', 'classes.edit', 'classes.schedule',
    'equipment.view', 'equipment.edit',
    'finance.view', 'finance.edit',
    'analytics.view', 'reports.view',
    'products.view', 'products.edit',
    'pos.view', 'pos.process',
    'leads.view', 'leads.create', 'leads.edit', 'leads.assign', 'leads.export',
    'referrals.view', 'referrals.create', 'referrals.edit', 'referrals.process',
    'feedback.view', 'feedback.create', 'feedback.edit', 'feedback.respond',
    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.assign',
    'diet-workout.view', 'diet-workout.create', 'diet-workout.edit', 'diet-workout.assign',
    'notifications.view', 'notifications.send',
    'sms.view', 'sms.send', 'sms.templates.view', 'sms.logs.view',
    'trainer.schedule.view', 'trainer.clients.view', 'trainer.workouts.assign',
    'staff.checkin.process', 'staff.support.handle', 'staff.orientation.conduct', 'staff.maintenance.report'
  )
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT manager_role.id, manager_perms.id
FROM manager_role, manager_perms
ON CONFLICT DO NOTHING;

-- Team Trainer permissions
WITH trainer_role AS (
  SELECT id FROM public.roles WHERE name = 'team-trainer'
),
trainer_perms AS (
  SELECT id FROM public.permissions WHERE name IN (
    'members.view', 'members.edit',
    'classes.view',
    'equipment.view',
    'analytics.view',
    'products.view',
    'feedback.view', 'feedback.create', 'feedback.edit',
    'diet-workout.view', 'diet-workout.create', 'diet-workout.edit', 'diet-workout.assign',
    'trainer.schedule.view', 'trainer.schedule.manage', 'trainer.clients.view', 'trainer.clients.manage',
    'trainer.workouts.create', 'trainer.workouts.assign', 'trainer.progress.track', 'trainer.earnings.view'
  )
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT trainer_role.id, trainer_perms.id
FROM trainer_role, trainer_perms
ON CONFLICT DO NOTHING;

-- Team Staff permissions
WITH staff_role AS (
  SELECT id FROM public.roles WHERE name = 'team-staff'
),
staff_perms AS (
  SELECT id FROM public.permissions WHERE name IN (
    'members.view', 'members.create', 'members.edit',
    'classes.view',
    'equipment.view',
    'analytics.view',
    'products.view',
    'pos.view', 'pos.process',
    'leads.view', 'leads.create', 'leads.edit',
    'referrals.view', 'referrals.create',
    'feedback.view', 'feedback.create', 'feedback.respond',
    'tasks.view', 'tasks.create', 'tasks.edit',
    'staff.checkin.process', 'staff.support.handle', 'staff.orientation.conduct', 'staff.maintenance.report'
  )
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT staff_role.id, staff_perms.id
FROM staff_role, staff_perms
ON CONFLICT DO NOTHING;

-- Member permissions
WITH member_role AS (
  SELECT id FROM public.roles WHERE name = 'member'
),
member_perms AS (
  SELECT id FROM public.permissions WHERE name IN (
    'classes.view',
    'equipment.view',
    'finance.view',
    'products.view',
    'referrals.view', 'referrals.create',
    'feedback.create',
    'diet-workout.view'
  )
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT member_role.id, member_perms.id
FROM member_role, member_perms
ON CONFLICT DO NOTHING;
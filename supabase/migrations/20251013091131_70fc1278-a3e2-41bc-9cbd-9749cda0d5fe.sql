-- Seed all permissions from rbac.ts
INSERT INTO public.permissions (name, display_name, module, category, description) VALUES
-- System Management
('system.view', 'View System', 'System Management', 'read', 'View system settings and status'),
('system.manage', 'Manage System', 'System Management', 'write', 'Manage system configuration'),
('system.backup', 'Backup System', 'System Management', 'write', 'Create system backups'),
('system.restore', 'Restore System', 'System Management', 'write', 'Restore from backups'),

-- Branch Management
('branches.view', 'View Branches', 'Branch Management', 'read', 'View branch information'),
('branches.create', 'Create Branches', 'Branch Management', 'create', 'Create new branches'),
('branches.edit', 'Edit Branches', 'Branch Management', 'write', 'Edit branch details'),
('branches.delete', 'Delete Branches', 'Branch Management', 'delete', 'Delete branches'),

-- User Management
('users.view', 'View Users', 'User Management', 'read', 'View user accounts'),
('users.create', 'Create Users', 'User Management', 'create', 'Create new users'),
('users.edit', 'Edit Users', 'User Management', 'write', 'Edit user details'),
('users.delete', 'Delete Users', 'User Management', 'delete', 'Delete user accounts'),
('users.export', 'Export Users', 'User Management', 'read', 'Export user data'),

-- Roles Management
('roles.view', 'View Roles', 'Roles Management', 'read', 'View role definitions'),
('roles.create', 'Create Roles', 'Roles Management', 'create', 'Create new roles'),
('roles.edit', 'Edit Roles', 'Roles Management', 'write', 'Edit role permissions'),
('roles.delete', 'Delete Roles', 'Roles Management', 'delete', 'Delete roles'),

-- Member Management
('members.view', 'View Members', 'Member Management', 'read', 'View member profiles'),
('members.create', 'Create Members', 'Member Management', 'create', 'Register new members'),
('members.edit', 'Edit Members', 'Member Management', 'write', 'Edit member information'),
('members.delete', 'Delete Members', 'Member Management', 'delete', 'Delete member accounts'),
('members.export', 'Export Members', 'Member Management', 'read', 'Export member data'),

-- Team Management
('team.view', 'View Team', 'Team Management', 'read', 'View team members'),
('team.create', 'Create Team Members', 'Team Management', 'create', 'Add team members'),
('team.edit', 'Edit Team Members', 'Team Management', 'write', 'Edit team details'),
('team.delete', 'Delete Team Members', 'Team Management', 'delete', 'Remove team members'),

-- Classes
('classes.view', 'View Classes', 'Classes & Training', 'read', 'View class schedules'),
('classes.create', 'Create Classes', 'Classes & Training', 'create', 'Create new classes'),
('classes.edit', 'Edit Classes', 'Classes & Training', 'write', 'Edit class details'),
('classes.delete', 'Delete Classes', 'Classes & Training', 'delete', 'Delete classes'),
('classes.schedule', 'Schedule Classes', 'Classes & Training', 'write', 'Manage class schedules'),

-- Equipment
('equipment.view', 'View Equipment', 'Equipment', 'read', 'View equipment inventory'),
('equipment.create', 'Create Equipment', 'Equipment', 'create', 'Add new equipment'),
('equipment.edit', 'Edit Equipment', 'Equipment', 'write', 'Edit equipment details'),
('equipment.delete', 'Delete Equipment', 'Equipment', 'delete', 'Remove equipment'),

-- Lockers
('lockers.view', 'View Lockers', 'Lockers', 'read', 'View locker status'),
('lockers.create', 'Create Lockers', 'Lockers', 'create', 'Add new lockers'),
('lockers.edit', 'Edit Lockers', 'Lockers', 'write', 'Edit locker details'),
('lockers.delete', 'Delete Lockers', 'Lockers', 'delete', 'Remove lockers'),
('lockers.assign', 'Assign Lockers', 'Lockers', 'write', 'Assign lockers to members'),
('lockers.release', 'Release Lockers', 'Lockers', 'write', 'Release locker assignments'),

-- Finance
('finance.view', 'View Finance', 'Finance', 'read', 'View financial data'),
('finance.create', 'Create Transactions', 'Finance', 'create', 'Create financial transactions'),
('finance.edit', 'Edit Transactions', 'Finance', 'write', 'Edit financial records'),
('finance.process', 'Process Payments', 'Finance', 'write', 'Process payments'),

-- Analytics & Reports
('analytics.view', 'View Analytics', 'Analytics & Reports', 'read', 'View analytics dashboards'),
('reports.view', 'View Reports', 'Analytics & Reports', 'read', 'View reports'),
('reports.export', 'Export Reports', 'Analytics & Reports', 'read', 'Export report data'),

-- Settings
('settings.view', 'View Settings', 'Settings', 'read', 'View system settings'),
('settings.edit', 'Edit Settings', 'Settings', 'write', 'Edit system settings'),

-- Products & POS
('products.view', 'View Products', 'Products & POS', 'read', 'View product catalog'),
('products.create', 'Create Products', 'Products & POS', 'create', 'Add new products'),
('products.edit', 'Edit Products', 'Products & POS', 'write', 'Edit product details'),
('products.delete', 'Delete Products', 'Products & POS', 'delete', 'Remove products'),
('pos.view', 'View POS', 'Products & POS', 'read', 'View POS interface'),
('pos.process', 'Process Sales', 'Products & POS', 'write', 'Process sales transactions'),

-- Leads
('leads.view', 'View Leads', 'Leads', 'read', 'View lead information'),
('leads.create', 'Create Leads', 'Leads', 'create', 'Add new leads'),
('leads.edit', 'Edit Leads', 'Leads', 'write', 'Edit lead details'),
('leads.delete', 'Delete Leads', 'Leads', 'delete', 'Remove leads'),
('leads.assign', 'Assign Leads', 'Leads', 'write', 'Assign leads to staff'),
('leads.export', 'Export Leads', 'Leads', 'read', 'Export lead data'),

-- Referrals
('referrals.view', 'View Referrals', 'Referrals', 'read', 'View referral data'),
('referrals.create', 'Create Referrals', 'Referrals', 'create', 'Create new referrals'),
('referrals.edit', 'Edit Referrals', 'Referrals', 'write', 'Edit referral details'),
('referrals.process', 'Process Referrals', 'Referrals', 'write', 'Process referral bonuses'),

-- Feedback
('feedback.view', 'View Feedback', 'Feedback', 'read', 'View member feedback'),
('feedback.create', 'Create Feedback', 'Feedback', 'create', 'Submit feedback'),
('feedback.edit', 'Edit Feedback', 'Feedback', 'write', 'Edit feedback'),
('feedback.delete', 'Delete Feedback', 'Feedback', 'delete', 'Remove feedback'),
('feedback.respond', 'Respond to Feedback', 'Feedback', 'write', 'Respond to feedback'),

-- Tasks
('tasks.view', 'View Tasks', 'Tasks', 'read', 'View task list'),
('tasks.create', 'Create Tasks', 'Tasks', 'create', 'Create new tasks'),
('tasks.edit', 'Edit Tasks', 'Tasks', 'write', 'Edit task details'),
('tasks.delete', 'Delete Tasks', 'Tasks', 'delete', 'Remove tasks'),
('tasks.assign', 'Assign Tasks', 'Tasks', 'write', 'Assign tasks to team'),

-- Diet & Workout
('diet-workout.view', 'View Plans', 'Diet & Workout', 'read', 'View diet/workout plans'),
('diet-workout.create', 'Create Plans', 'Diet & Workout', 'create', 'Create diet/workout plans'),
('diet-workout.edit', 'Edit Plans', 'Diet & Workout', 'write', 'Edit diet/workout plans'),
('diet-workout.assign', 'Assign Plans', 'Diet & Workout', 'write', 'Assign plans to members'),

-- Notifications
('notifications.view', 'View Notifications', 'Communication', 'read', 'View notifications'),
('notifications.send', 'Send Notifications', 'Communication', 'write', 'Send notifications'),

-- SMS
('sms.view', 'View SMS', 'Communication', 'read', 'View SMS history'),
('sms.send', 'Send SMS', 'Communication', 'write', 'Send SMS messages'),
('sms.templates.view', 'View SMS Templates', 'Communication', 'read', 'View SMS templates'),
('sms.templates.create', 'Create SMS Templates', 'Communication', 'create', 'Create SMS templates'),
('sms.templates.edit', 'Edit SMS Templates', 'Communication', 'write', 'Edit SMS templates'),
('sms.templates.delete', 'Delete SMS Templates', 'Communication', 'delete', 'Remove SMS templates'),
('sms.settings.view', 'View SMS Settings', 'Communication', 'read', 'View SMS settings'),
('sms.settings.edit', 'Edit SMS Settings', 'Communication', 'write', 'Edit SMS settings'),
('sms.providers.view', 'View SMS Providers', 'Communication', 'read', 'View SMS provider config'),
('sms.providers.create', 'Create SMS Providers', 'Communication', 'create', 'Add SMS providers'),
('sms.providers.edit', 'Edit SMS Providers', 'Communication', 'write', 'Edit SMS provider config'),
('sms.providers.delete', 'Delete SMS Providers', 'Communication', 'delete', 'Remove SMS providers'),
('sms.logs.view', 'View SMS Logs', 'Communication', 'read', 'View SMS delivery logs'),
('sms.logs.export', 'Export SMS Logs', 'Communication', 'read', 'Export SMS log data'),
('sms.analytics.view', 'View SMS Analytics', 'Communication', 'read', 'View SMS analytics'),

-- Trainer
('trainer.schedule.view', 'View Schedule', 'Trainer Management', 'read', 'View trainer schedule'),
('trainer.schedule.manage', 'Manage Schedule', 'Trainer Management', 'write', 'Manage trainer schedule'),
('trainer.clients.view', 'View Clients', 'Trainer Management', 'read', 'View assigned clients'),
('trainer.clients.manage', 'Manage Clients', 'Trainer Management', 'write', 'Manage client assignments'),
('trainer.workouts.create', 'Create Workouts', 'Trainer Management', 'create', 'Create workout plans'),
('trainer.workouts.assign', 'Assign Workouts', 'Trainer Management', 'write', 'Assign workout plans'),
('trainer.progress.track', 'Track Progress', 'Trainer Management', 'write', 'Track client progress'),
('trainer.earnings.view', 'View Earnings', 'Trainer Management', 'read', 'View trainer earnings'),

-- Staff
('staff.checkin.process', 'Process Check-ins', 'Staff Operations', 'write', 'Process member check-ins'),
('staff.support.handle', 'Handle Support', 'Staff Operations', 'write', 'Handle support requests'),
('staff.orientation.conduct', 'Conduct Orientation', 'Staff Operations', 'write', 'Conduct member orientation'),
('staff.maintenance.report', 'Report Maintenance', 'Staff Operations', 'write', 'Report maintenance issues'),

-- Attendance
('attendance.view', 'View Attendance', 'Attendance', 'read', 'View attendance records'),
('attendance.create', 'Create Attendance', 'Attendance', 'create', 'Create attendance records'),
('attendance.edit', 'Edit Attendance', 'Attendance', 'write', 'Edit attendance records'),
('attendance.delete', 'Delete Attendance', 'Attendance', 'delete', 'Remove attendance records'),
('attendance.export', 'Export Attendance', 'Attendance', 'read', 'Export attendance data'),
('attendance.checkin.manual', 'Manual Check-in', 'Attendance', 'write', 'Manual member check-in'),
('attendance.checkout.manual', 'Manual Check-out', 'Attendance', 'write', 'Manual member check-out'),
('attendance.approve', 'Approve Attendance', 'Attendance', 'write', 'Approve attendance records'),
('attendance.reports.view', 'View Attendance Reports', 'Attendance', 'read', 'View attendance reports'),

-- Devices
('devices.view', 'View Devices', 'Devices', 'read', 'View device status'),
('devices.create', 'Create Devices', 'Devices', 'create', 'Add new devices'),
('devices.edit', 'Edit Devices', 'Devices', 'write', 'Edit device settings'),
('devices.delete', 'Delete Devices', 'Devices', 'delete', 'Remove devices'),
('devices.sync', 'Sync Devices', 'Devices', 'write', 'Sync device data'),
('devices.settings', 'Device Settings', 'Devices', 'write', 'Configure device settings'),
('devices.maintenance', 'Device Maintenance', 'Devices', 'write', 'Perform device maintenance'),
('devices.restart', 'Restart Devices', 'Devices', 'write', 'Restart devices'),
('devices.logs.view', 'View Device Logs', 'Devices', 'read', 'View device logs')
ON CONFLICT (name) DO NOTHING;

export type Permission = 
  // System Management (Super Admin only)
  | 'system.view' | 'system.manage' | 'system.backup' | 'system.restore'
  // Branch Management
  | 'branches.view' | 'branches.create' | 'branches.edit' | 'branches.delete'
  // User Management
  | 'users.view' | 'users.create' | 'users.edit' | 'users.delete' | 'users.export'
  // Role Management
  | 'roles.view' | 'roles.create' | 'roles.edit' | 'roles.delete'
  // Member Management
  | 'members.view' | 'members.create' | 'members.edit' | 'members.delete' | 'members.export'
  // Team Management
  | 'team.view' | 'team.create' | 'team.edit' | 'team.delete'
  // Class Management
  | 'classes.view' | 'classes.create' | 'classes.edit' | 'classes.delete' | 'classes.schedule'
  // Equipment Management
  | 'equipment.view' | 'equipment.create' | 'equipment.edit' | 'equipment.delete'
  // Locker Management
  | 'lockers.view' | 'lockers.create' | 'lockers.edit' | 'lockers.delete' | 'lockers.assign' | 'lockers.release'
  // Finance Management
  | 'finance.view' | 'finance.create' | 'finance.edit' | 'finance.process'
  // Analytics & Reports
  | 'analytics.view' | 'reports.view' | 'reports.export'
  // Settings
  | 'settings.view' | 'settings.edit'
  // Products & POS
  | 'products.view' | 'products.create' | 'products.edit' | 'products.delete'
  | 'pos.view' | 'pos.process'
  // Lead Management
  | 'leads.view' | 'leads.create' | 'leads.edit' | 'leads.delete' | 'leads.assign' | 'leads.export'
  // Referral Management
  | 'referrals.view' | 'referrals.create' | 'referrals.edit' | 'referrals.process'
  // Feedback Management
  | 'feedback.view' | 'feedback.create' | 'feedback.edit' | 'feedback.delete' | 'feedback.respond' | 'feedback.export'
  // Staff Management
  | 'staff.view' | 'staff.create' | 'staff.edit' | 'staff.delete'
  // Task Management
  | 'tasks.view' | 'tasks.create' | 'tasks.edit' | 'tasks.delete' | 'tasks.assign'
  // Diet & Workout
  | 'diet-workout.view' | 'diet-workout.create' | 'diet-workout.edit' | 'diet-workout.assign'
  // Notifications
  | 'notifications.view' | 'notifications.send'
  // SMS Management
  | 'sms.view' | 'sms.send' | 'sms.templates.view' | 'sms.templates.create' | 'sms.templates.edit' | 'sms.templates.delete'
  | 'sms.settings.view' | 'sms.settings.edit' | 'sms.providers.view' | 'sms.providers.create' | 'sms.providers.edit' | 'sms.providers.delete'
  | 'sms.logs.view' | 'sms.logs.export' | 'sms.analytics.view'
  // Trainer-specific permissions
  | 'trainer.schedule.view' | 'trainer.schedule.manage' | 'trainer.clients.view' | 'trainer.clients.manage'
  | 'trainer.workouts.create' | 'trainer.workouts.assign' | 'trainer.progress.track' | 'trainer.earnings.view'
  // Staff-specific permissions
  | 'staff.checkin.process' | 'staff.support.handle' | 'staff.orientation.conduct' | 'staff.maintenance.report'
  // Attendance Management
  | 'attendance.view' | 'attendance.create' | 'attendance.edit' | 'attendance.delete' | 'attendance.export'
  | 'attendance.checkin.manual' | 'attendance.checkout.manual' | 'attendance.approve' | 'attendance.reports.view'
  // Device Management
  | 'devices.view' | 'devices.create' | 'devices.edit' | 'devices.delete' | 'devices.sync' | 'devices.settings'
  | 'devices.maintenance' | 'devices.restart' | 'devices.logs.view';

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  color: string;
  isSystem: boolean;
  scope: 'global' | 'branch' | 'self'; // Data access scope
  createdAt: Date;
  updatedAt: Date;
}

import { User } from './auth';

export interface UserWithRoles extends User {
  roles: RoleDefinition[];
  isActive: boolean;
  lastLogin?: Date;
  createdBy?: string;
  updatedBy?: string;
  customPermissions?: Permission[];
  deniedPermissions?: Permission[];
  // Branch context
  assignedBranches?: string[]; // For users who can access multiple branches
  primaryBranchId?: string;
}

export interface RBACContext {
  currentUser: UserWithRoles | null;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  getUserPermissions: () => Permission[];
  canAccessResource: (resource: string, action: string) => boolean;
  canAccessBranch: (branchId: string) => boolean;
  getCurrentBranchId: () => string | null;
  isTrainer: () => boolean;
  isStaff: () => boolean;
  isManager: () => boolean;
  isLoadingPermissions: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  branchId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  branchId?: string;
  type: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view' | 'export';
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

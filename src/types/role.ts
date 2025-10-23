export type RoleScope = 'global' | 'branch' | 'gym';
export type PermissionCategory = 'member_management' | 'finance' | 'scheduling' | 'reporting' | 'settings' | 'staff';

export interface Permission {
  id: string;
  name: string;
  description?: string;
  category: PermissionCategory;
  module?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  scope: RoleScope;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  branchId?: string;
  role: Role;
  createdAt: string;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  scope: RoleScope;
  permissionIds: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export interface AssignRoleInput {
  userId: string;
  roleId: string;
  branchId?: string;
}

export interface RoleFilters {
  scope?: RoleScope;
  search?: string;
  page?: number;
  limit?: number;
}

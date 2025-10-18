import { useApiQuery, useApiMutation } from './useApiQuery';

export interface RoleWithCount {
  role_id: string;
  role_name: string;
  display_name: string;
  description: string;
  color: string;
  is_system: boolean;
  user_count: number;
  permission_count: number;
  created_at: string;
}

export interface Permission {
  id: string;
  name: string;
  display_name: string;
  category: 'read' | 'write' | 'create' | 'delete';
  description?: string;
}

export interface PermissionsByModule {
  module: string;
  permissions: Permission[];
}

export const useRolesManagement = () => {
  const rolesQuery = useApiQuery<RoleWithCount[]>(['roles-with-counts'], '/api/roles/with-counts');
  const permissionsQuery = useApiQuery<PermissionsByModule[]>(['permissions-by-module'], '/api/permissions/by-module');

  const useRolePermissions = (roleId?: string) => {
    return useApiQuery(
      ['role-permissions', roleId],
      `/api/roles/${roleId}/permissions`,
      { enabled: !!roleId }
    );
  };

  const createRole = useApiMutation(
    '/api/roles',
    'post',
    {
      invalidateQueries: [['roles-with-counts']],
      successMessage: 'Role created successfully'
    }
  );

  const updateRolePermissions = useApiMutation(
    '/api/roles/permissions',
    'put',
    {
      invalidateQueries: [['roles-with-counts'], ['role-permissions']],
      successMessage: 'Permissions updated successfully'
    }
  );

  const deleteRole = useApiMutation(
    '/api/roles',
    'delete',
    {
      invalidateQueries: [['roles-with-counts']],
      successMessage: 'Role deleted successfully'
    }
  );

  return {
    roles: rolesQuery.data,
    rolesLoading: rolesQuery.isLoading,
    permissionsByModule: permissionsQuery.data,
    permissionsLoading: permissionsQuery.isLoading,
    useRolePermissions,
    createRole,
    updateRolePermissions,
    deleteRole
  };
};

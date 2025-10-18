import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const queryClient = useQueryClient();

  // Fetch all roles with user counts
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles-with-counts'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_roles_with_counts' as any);
      if (error) throw error;
      return data as unknown as RoleWithCount[];
    }
  });

  // Fetch permissions grouped by module
  const { data: permissionsByModule, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions-by-module'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_permissions_by_module' as any);
      if (error) throw error;
      return data as unknown as PermissionsByModule[];
    }
  });

  // Fetch permissions for a specific role
  const useRolePermissions = (roleId?: string) => {
    return useQuery({
      queryKey: ['role-permissions', roleId],
      queryFn: async () => {
        if (!roleId) return [];
        const { data, error } = await supabase.rpc('get_role_permissions' as any, {
          _role_id: roleId
        });
        if (error) throw error;
        return (data as any[]).map(d => d.permission_id);
      },
      enabled: !!roleId
    });
  };

  // Create new role
  const createRole = useMutation({
    mutationFn: async (roleData: {
      name: string;
      display_name: string;
      description: string;
      color: string;
      permission_ids: string[];
    }) => {
      // Insert role
      const { data: role, error: roleError } = await supabase
        .from('roles' as any)
        .insert({
          name: roleData.name,
          display_name: roleData.display_name,
          description: roleData.description,
          color: roleData.color,
          is_system: false
        })
        .select()
        .single();

      if (roleError) throw roleError;
      if (!role) throw new Error('Failed to create role');

      // Insert role permissions
      if (roleData.permission_ids.length > 0) {
        const { error: permError } = await supabase
          .from('role_permissions' as any)
          .insert(
            roleData.permission_ids.map(pid => ({
              role_id: (role as any).id,
              permission_id: pid
            })) as any
          );
        if (permError) throw permError;
      }

      return role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles-with-counts'] });
      toast.success('Role created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create role');
    }
  });

  // Update role permissions
  const updateRolePermissions = useMutation({
    mutationFn: async ({
      roleId,
      permissionIds
    }: {
      roleId: string;
      permissionIds: string[];
    }) => {
      // Delete existing permissions
      await supabase
        .from('role_permissions' as any)
        .delete()
        .eq('role_id', roleId);

      // Insert new permissions
      if (permissionIds.length > 0) {
        const { error } = await supabase
          .from('role_permissions' as any)
          .insert(
            permissionIds.map(pid => ({
              role_id: roleId,
              permission_id: pid
            })) as any
          );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles-with-counts'] });
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast.success('Permissions updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update permissions');
    }
  });

  // Delete role
  const deleteRole = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('roles' as any)
        .delete()
        .eq('id', roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles-with-counts'] });
      toast.success('Role deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete role');
    }
  });

  return {
    roles,
    rolesLoading,
    permissionsByModule,
    permissionsLoading,
    useRolePermissions,
    createRole,
    updateRolePermissions,
    deleteRole
  };
};

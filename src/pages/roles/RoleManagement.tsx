import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Shield, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { RoleCard } from '@/components/roles/RoleCard';
import { AddNewRoleModal } from '@/components/roles/AddNewRoleModal';
import { EditRolePermissionsModal } from '@/components/roles/EditRolePermissionsModal';
import { useRolesManagement } from '@/hooks/useRolesManagement';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function RoleManagement() {
  const {
    roles,
    rolesLoading,
    permissionsByModule,
    permissionsLoading,
    useRolePermissions,
    createRole,
    updateRolePermissions,
    deleteRole
  } = useRolesManagement();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  const { data: currentPermissions } = useRolePermissions(selectedRole?.role_id);

  const handleCreateRole = async (roleData: any) => {
    await createRole.mutateAsync(roleData);
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setEditModalOpen(true);
  };

  const handleUpdatePermissions = async (permissionIds: string[]) => {
    if (!selectedRole) return;
    
    await updateRolePermissions.mutateAsync({
      roleId: selectedRole.role_id,
      permissionIds
    });
    setEditModalOpen(false);
  };

  const handleDeleteClick = (roleId: string) => {
    setRoleToDelete(roleId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (roleToDelete) {
      await deleteRole.mutateAsync(roleToDelete);
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  if (rolesLoading || permissionsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Roles & Permissions
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage user roles and their associated permissions across your organization
            </p>
          </div>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            System roles (marked with a badge) cannot be deleted or have their structure modified,
            but you can view their permissions. Custom roles can be fully managed.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add New Role Card */}
          <Card
            className="border-dashed border-2 hover:border-primary cursor-pointer transition-colors"
            onClick={() => setAddModalOpen(true)}
          >
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Add New Role</h3>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Create a custom role with specific permissions
              </p>
            </CardContent>
          </Card>

          {/* Existing Roles */}
          {roles?.map(role => (
            <RoleCard
              key={role.role_id}
              role={role}
              onEdit={() => handleEditRole(role)}
              onDelete={() => handleDeleteClick(role.role_id)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddNewRoleModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleCreateRole}
        permissionsByModule={permissionsByModule || []}
        isLoading={createRole.isPending}
      />

      {selectedRole && (
        <EditRolePermissionsModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedRole(null);
          }}
          role={selectedRole}
          permissionsByModule={permissionsByModule || []}
          currentPermissions={currentPermissions || []}
          onSave={handleUpdatePermissions}
          isLoading={updateRolePermissions.isPending}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this role. Users currently assigned to this role
              will need to be reassigned. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoleToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

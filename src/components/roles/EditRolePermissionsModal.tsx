import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { RoleWithCount, PermissionsByModule } from '@/hooks/useRolesManagement';

interface EditRolePermissionsModalProps {
  open: boolean;
  onClose: () => void;
  role: RoleWithCount;
  permissionsByModule: PermissionsByModule[];
  currentPermissions: string[];
  onSave: (permissionIds: string[]) => void;
  isLoading?: boolean;
}

export const EditRolePermissionsModal = ({
  open,
  onClose,
  role,
  permissionsByModule,
  currentPermissions,
  onSave,
  isLoading
}: EditRolePermissionsModalProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(currentPermissions)
  );

  useEffect(() => {
    setSelectedPermissions(new Set(currentPermissions));
  }, [currentPermissions, open]);

  const togglePermission = (permId: string) => {
    if (role.is_system) return; // Don't allow editing system roles
    
    setSelectedPermissions(prev => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  const handleSave = () => {
    onSave(Array.from(selectedPermissions));
  };

  const getPermissionsByCategory = (module: PermissionsByModule, category: string) => {
    return module.permissions.filter(p => p.category === category);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: role.color + '20' }}
            >
              <span className="text-lg font-bold" style={{ color: role.color }}>
                {role.display_name.charAt(0)}
              </span>
            </div>
            <div>
              <DialogTitle>Edit Role: {role.display_name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                {role.description}
                {role.is_system && (
                  <Badge variant="secondary" className="text-xs">
                    System Role (Read Only)
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-220px)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Module</TableHead>
                <TableHead className="text-center w-[120px]">Read</TableHead>
                <TableHead className="text-center w-[120px]">Write</TableHead>
                <TableHead className="text-center w-[120px]">Create</TableHead>
                <TableHead className="text-center w-[120px]">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissionsByModule.map(module => {
                const readPerms = getPermissionsByCategory(module, 'read');
                const writePerms = getPermissionsByCategory(module, 'write');
                const createPerms = getPermissionsByCategory(module, 'create');
                const deletePerms = getPermissionsByCategory(module, 'delete');

                const hasAnyPermission = 
                  readPerms.length > 0 ||
                  writePerms.length > 0 ||
                  createPerms.length > 0 ||
                  deletePerms.length > 0;

                if (!hasAnyPermission) return null;

                return (
                  <TableRow key={module.module}>
                    <TableCell className="font-medium">{module.module}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        {readPerms.map(perm => (
                          <div key={perm.id} className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedPermissions.has(perm.id)}
                              onCheckedChange={() => togglePermission(perm.id)}
                              title={perm.display_name}
                              disabled={role.is_system}
                            />
                            <span className="text-xs text-muted-foreground">
                              {perm.display_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        {writePerms.map(perm => (
                          <div key={perm.id} className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedPermissions.has(perm.id)}
                              onCheckedChange={() => togglePermission(perm.id)}
                              title={perm.display_name}
                              disabled={role.is_system}
                            />
                            <span className="text-xs text-muted-foreground">
                              {perm.display_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        {createPerms.map(perm => (
                          <div key={perm.id} className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedPermissions.has(perm.id)}
                              onCheckedChange={() => togglePermission(perm.id)}
                              title={perm.display_name}
                              disabled={role.is_system}
                            />
                            <span className="text-xs text-muted-foreground">
                              {perm.display_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        {deletePerms.map(perm => (
                          <div key={perm.id} className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedPermissions.has(perm.id)}
                              onCheckedChange={() => togglePermission(perm.id)}
                              title={perm.display_name}
                              disabled={role.is_system}
                            />
                            <span className="text-xs text-muted-foreground">
                              {perm.display_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {role.is_system ? 'Close' : 'Cancel'}
          </Button>
          {!role.is_system && (
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

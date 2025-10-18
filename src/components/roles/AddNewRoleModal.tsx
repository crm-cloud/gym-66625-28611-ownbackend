import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { PermissionsByModule } from '@/hooks/useRolesManagement';

interface AddNewRoleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    display_name: string;
    description: string;
    color: string;
    permission_ids: string[];
  }) => void;
  permissionsByModule: PermissionsByModule[];
  isLoading?: boolean;
}

export const AddNewRoleModal = ({
  open,
  onClose,
  onSubmit,
  permissionsByModule,
  isLoading
}: AddNewRoleModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    color: '#6366f1'
  });
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      permission_ids: Array.from(selectedPermissions)
    });
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      color: '#6366f1'
    });
    setSelectedPermissions(new Set());
    onClose();
  };

  const togglePermission = (permId: string) => {
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

  const selectAllInModule = (module: PermissionsByModule) => {
    const allIds = module.permissions.map(p => p.id);
    const allSelected = allIds.every(id => selectedPermissions.has(id));
    
    setSelectedPermissions(prev => {
      const next = new Set(prev);
      if (allSelected) {
        allIds.forEach(id => next.delete(id));
      } else {
        allIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Role</DialogTitle>
          <DialogDescription>
            Create a custom role with specific permissions for your organization
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="space-y-6 pr-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Role Name (ID)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="custom-role"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use lowercase with hyphens
                </p>
              </div>
              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Custom Role"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this role's purpose and responsibilities..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="color">Role Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10"
                />
                <span className="text-sm text-muted-foreground">{formData.color}</span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4 text-lg">Role Permissions</h3>
              {permissionsByModule.map(module => (
                <div key={module.module} className="mb-6 border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{module.module}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => selectAllInModule(module)}
                      type="button"
                    >
                      {module.permissions.every(p => selectedPermissions.has(p.id))
                        ? 'Deselect All'
                        : 'Select All'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {module.permissions.map(perm => (
                      <div key={perm.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={perm.id}
                          checked={selectedPermissions.has(perm.id)}
                          onCheckedChange={() => togglePermission(perm.id)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={perm.id} className="text-sm cursor-pointer font-normal">
                            {perm.display_name}
                          </Label>
                          {perm.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {perm.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.name || !formData.display_name || isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

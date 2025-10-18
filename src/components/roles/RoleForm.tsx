import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';

interface RoleFormData {
  name: string;
  description: string;
  color: string;
  permissions: string[];
}

const initialData: RoleFormData = {
  name: '',
  description: '',
  color: '#3b82f6',
  permissions: []
};

const formConfig = {
  name: {
    rules: [
      validationRules.required,
      validationRules.minLength(2)
    ]
  },
  description: {
    rules: [validationRules.required]
  }
};

const permissionCategories = [
  {
    name: 'User Management',
    permissions: [
      { id: 'users.view', name: 'View Users', description: 'Can view user list and profiles' },
      { id: 'users.create', name: 'Create Users', description: 'Can create new user accounts' },
      { id: 'users.edit', name: 'Edit Users', description: 'Can modify user information' },
      { id: 'users.delete', name: 'Delete Users', description: 'Can delete user accounts' }
    ]
  },
  {
    name: 'Role Management',
    permissions: [
      { id: 'roles.view', name: 'View Roles', description: 'Can view roles and permissions' },
      { id: 'roles.create', name: 'Create Roles', description: 'Can create new roles' },
      { id: 'roles.edit', name: 'Edit Roles', description: 'Can modify role permissions' },
      { id: 'roles.delete', name: 'Delete Roles', description: 'Can delete custom roles' }
    ]
  },
  {
    name: 'Member Management',
    permissions: [
      { id: 'members.view', name: 'View Members', description: 'Can view member list and profiles' },
      { id: 'members.create', name: 'Create Members', description: 'Can register new members' },
      { id: 'members.edit', name: 'Edit Members', description: 'Can modify member information' },
      { id: 'members.delete', name: 'Delete Members', description: 'Can remove member accounts' }
    ]
  },
  {
    name: 'Financial Management',
    permissions: [
      { id: 'finance.view', name: 'View Finances', description: 'Can view financial reports' },
      { id: 'finance.manage', name: 'Manage Finances', description: 'Can manage transactions and billing' }
    ]
  },
  {
    name: 'System Administration',
    permissions: [
      { id: 'system.view', name: 'View System', description: 'Can view system health and settings' },
      { id: 'system.manage', name: 'Manage System', description: 'Can modify system configuration' },
      { id: 'system.backup', name: 'System Backup', description: 'Can perform system backups' }
    ]
  }
];

export function RoleForm() {
  const [formData, setFormData] = useState<RoleFormData>(initialData);
  const navigate = useNavigate();
  
  const {
    errors,
    isSubmitting,
    validateField,
    validateForm,
    clearErrors,
    setSubmitting,
    showErrorToast,
    showSuccessToast
  } = useFormValidation(formConfig);

  const handleInputChange = (field: keyof RoleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      clearErrors(field);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleCategoryToggle = (categoryPermissions: string[]) => {
    const allSelected = categoryPermissions.every(p => formData.permissions.includes(p));
    
    if (allSelected) {
      // Remove all permissions from this category
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !categoryPermissions.includes(p))
      }));
    } else {
      // Add all permissions from this category
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...categoryPermissions])]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      showErrorToast('Please correct the errors in the form');
      return;
    }

    if (formData.permissions.length === 0) {
      showErrorToast('Please select at least one permission');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccessToast('Role created successfully');
      navigate('/roles');
    } catch (error) {
      showErrorToast('Failed to create role. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Role Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onBlur={() => validateField('name', formData.name)}
            placeholder="Enter role name"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Role Color</Label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id="color"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className="w-12 h-10 rounded border border-border"
            />
            <Input
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              placeholder="#3b82f6"
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            onBlur={() => validateField('description', formData.description)}
            placeholder="Describe the role's purpose and responsibilities"
            rows={3}
            className={errors.description ? 'border-destructive' : ''}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description}</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permission Assignment</CardTitle>
          <CardDescription>
            Select the permissions this role should have. Group by category for easier management.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {formData.permissions.length} permissions selected
            </Badge>
          </div>
          
          {permissionCategories.map((category, index) => {
            const categoryPermissionIds = category.permissions.map(p => p.id);
            const selectedCount = categoryPermissionIds.filter(p => formData.permissions.includes(p)).length;
            const allSelected = selectedCount === categoryPermissionIds.length;
            const someSelected = selectedCount > 0 && selectedCount < categoryPermissionIds.length;

            return (
              <div key={category.name} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={() => handleCategoryToggle(categoryPermissionIds)}
                    />
                    <Label className="text-base font-medium">{category.name}</Label>
                    <Badge variant="outline">
                      {selectedCount}/{categoryPermissionIds.length}
                    </Badge>
                  </div>
                </div>
                
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.permissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={formData.permissions.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />
                      <Label htmlFor={permission.id} className="flex-1">
                        <div>
                          <div className="font-medium">{permission.name}</div>
                          <div className="text-sm text-muted-foreground">{permission.description}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
                
                {index < permissionCategories.length - 1 && <Separator />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/roles')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Role'}
        </Button>
      </div>
    </form>
  );
}
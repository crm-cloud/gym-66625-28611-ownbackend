import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';
import { mockRoles } from '@/hooks/useRBAC';

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  branchId: string;
  roleIds: string[];
  isActive: boolean;
}

const initialData: UserFormData = {
  name: '',
  email: '',
  phone: '',
  department: '',
  branchId: '',
  roleIds: [],
  isActive: true
};

const formConfig = {
  name: {
    rules: [
      validationRules.required,
      validationRules.minLength(2)
    ]
  },
  email: {
    rules: [
      validationRules.required,
      validationRules.email
    ]
  },
  phone: {
    rules: [
      validationRules.required,
      validationRules.phone
    ]
  },
  department: {
    rules: [validationRules.required]
  }
};

export function UserForm() {
  const [formData, setFormData] = useState<UserFormData>(initialData);
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

  const roles = Object.values(mockRoles);
  const departments = ['Management', 'Training', 'Sales', 'Customer Service', 'Maintenance', 'Administration'];
  const branches = [
    { id: 'branch_1', name: 'Downtown Branch' },
    { id: 'branch_2', name: 'Uptown Fitness' },
    { id: 'branch_3', name: 'Westside Gym' }
  ];

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      clearErrors(field);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      showErrorToast('Please correct the errors in the form');
      return;
    }

    if (formData.roleIds.length === 0) {
      showErrorToast('Please select at least one role');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccessToast('User created successfully');
      navigate('/users');
    } catch (error) {
      showErrorToast('Failed to create user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onBlur={() => validateField('name', formData.name)}
            placeholder="Enter full name"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => validateField('email', formData.email)}
            placeholder="user@gymfit.com"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            onBlur={() => validateField('phone', formData.phone)}
            placeholder="+1 (555) 123-4567"
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department *</Label>
          <Select onValueChange={(value) => handleInputChange('department', value)}>
            <SelectTrigger className={errors.department ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department && (
            <p className="text-sm text-destructive">{errors.department}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch">Branch</Label>
          <Select onValueChange={(value) => handleInputChange('branchId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label htmlFor="isActive">Active User</Label>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Assignment</CardTitle>
          <CardDescription>
            Select the roles this user should have. Users can have multiple roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center space-x-2">
                <Checkbox
                  id={role.id}
                  checked={formData.roleIds.includes(role.id)}
                  onCheckedChange={() => handleRoleToggle(role.id)}
                />
                <Label htmlFor={role.id} className="flex-1">
                  <div>
                    <div className="font-medium">{role.name}</div>
                    <div className="text-sm text-muted-foreground">{role.description}</div>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/users')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create User'}
        </Button>
      </div>
    </form>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useCreateBranch, useUpdateBranch } from '@/hooks/useBranches';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BranchFormData {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  managerId: string;
  capacity: number;
  description: string;
}

const initialData: BranchFormData = {
  name: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
  email: '',
  managerId: '',
  capacity: 100,
  description: ''
};

interface BranchFormProps {
  branch?: any;
  onSuccess?: () => void;
}

export function BranchForm({ branch, onSuccess }: BranchFormProps) {
  const [formData, setFormData] = useState<BranchFormData>({
    ...initialData,
    ...(branch ? {
      name: branch.name || '',
      street: branch.address?.street || '',
      city: branch.address?.city || '',
      state: branch.address?.state || '',
      zipCode: branch.address?.zipCode || '',
      phone: branch.contact?.phone || '',
      email: branch.contact?.email || '',
      managerId: branch.manager_id || '',
      capacity: branch.capacity || 100,
      description: ''
    } : {})
  });
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get available managers using REST API
  const { teamMembers: managers = [] } = useTeamMembers({
    role: 'manager',
    is_active: true
  });

  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch();

  const handleInputChange = (field: keyof BranchFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Branch name is required';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const branchData = {
      name: formData.name,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      },
      contact: {
        phone: formData.phone,
        email: formData.email
      },
      capacity: formData.capacity,
      manager_id: formData.managerId || null,
      gym_id: authState.user?.gym_id,
      hours: {},
      status: 'active'
    };

    if (branch) {
      updateBranchMutation.mutate({ 
        branchId: branch.id, 
        data: branchData 
      }, {
        onSuccess: () => {
          if (onSuccess) onSuccess();
          else navigate('/branches');
        }
      });
    } else {
      createBranchMutation.mutate(branchData, {
        onSuccess: () => {
          if (onSuccess) onSuccess();
          else navigate('/branches');
        }
      });
    }
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Branch Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter branch name"
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
            placeholder="branch@gymfit.com"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="street">Street Address *</Label>
          <Input
            id="street"
            value={formData.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
            placeholder="Street address"
            className={errors.street ? 'border-destructive' : ''}
          />
          {errors.street && (
            <p className="text-sm text-destructive">{errors.street}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="City"
            className={errors.city ? 'border-destructive' : ''}
          />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Select onValueChange={(value) => handleInputChange('state', value)}>
            <SelectTrigger className={errors.state ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && (
            <p className="text-sm text-destructive">{errors.state}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">Zip Code *</Label>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
            placeholder="12345"
            className={errors.zipCode ? 'border-destructive' : ''}
          />
          {errors.zipCode && (
            <p className="text-sm text-destructive">{errors.zipCode}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="managerId">Branch Manager</Label>
          <Select onValueChange={(value) => handleInputChange('managerId', value)} value={formData.managerId}>
            <SelectTrigger className={errors.managerId ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select a manager" />
            </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No manager assigned</SelectItem>
                {managers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    {manager.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
          </Select>
          {errors.managerId && (
            <p className="text-sm text-destructive">{errors.managerId}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity *</Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
            placeholder="100"
            className={errors.capacity ? 'border-destructive' : ''}
          />
          {errors.capacity && (
            <p className="text-sm text-destructive">{errors.capacity}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Optional description of the branch"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess ? onSuccess() : navigate('/branches')}
          disabled={createBranchMutation.isPending || updateBranchMutation.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={createBranchMutation.isPending || updateBranchMutation.isPending}>
          {(createBranchMutation.isPending || updateBranchMutation.isPending) ? 'Saving...' : branch ? 'Update Branch' : 'Create Branch'}
        </Button>
      </div>
    </form>
  );
}
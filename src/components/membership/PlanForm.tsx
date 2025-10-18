import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';
import { useCurrency } from '@/hooks/useCurrency';
import { useBranchContext } from '@/hooks/useBranchContext';
import { membershipService } from '@/services/membershipService';

interface PlanFormData {
  name: string;
  description: string;
  price: string;
  duration: string;
  durationType: string;
  features: string[];
  isActive: boolean;
  maxMembers: string;
  accessHours: string;
  personalTrainerSessions: string;
  groupClassAccess: boolean;
  lockerAccess: boolean;
  guestPasses: string;
  featureQuantities: Record<string, number>;
}

const initialData: PlanFormData = {
  name: '',
  description: '',
  price: '',
  duration: '',
  durationType: 'month',
  features: [],
  isActive: true,
  maxMembers: '',
  accessHours: '24/7',
  personalTrainerSessions: '0',
  groupClassAccess: true,
  lockerAccess: true,
  guestPasses: '0',
  featureQuantities: {}
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
  },
  price: {
    rules: [
      validationRules.required,
      validationRules.numeric
    ]
  },
  duration: {
    rules: [
      validationRules.required,
      validationRules.numeric
    ]
  }
};

// Fallback session-based features when DB has no amenities configured
const sessionBasedFeatures = [
  'Yoga sessions',
  'Zumba classes',
  'Personal training sessions',
  // Add more session-based amenities here as needed
];

// Fallback available features when DB has no amenities configured
const availableFeatures = [
  'Unlimited gym access',
  'Group fitness classes',
  'Personal training sessions',
  'Locker room access',
  'Towel service',
  'Free parking',
  'Nutrition consultation',
  'Massage therapy',
  'Sauna',
  'Steam bath',
  'Swimming pool access',
  'Cardio room access',
  'Rock climbing wall',
  'Basketball court',
  'Racquetball courts',
  'Childcare services',
  'Yoga sessions',
  'Zumba classes'
];

export function PlanForm() {
  const [formData, setFormData] = useState<PlanFormData>(initialData);
  const [branchAmenities, setBranchAmenities] = useState<{ name: string; isSessionBased: boolean }[] | null>(null);
  const [amenitiesLoading, setAmenitiesLoading] = useState(false);
  const [creatingAmenity, setCreatingAmenity] = useState(false);
  const [newAmenityName, setNewAmenityName] = useState('');
  const [newAmenitySessionBased, setNewAmenitySessionBased] = useState(false);
  const [newAmenityQty, setNewAmenityQty] = useState<number>(0);
  const navigate = useNavigate();
  const { symbol } = useCurrency();
  const { currentBranchId } = useBranchContext();
  
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

  // Load branch-specific amenities when branch changes
  useEffect(() => {
    // Skip branch amenities loading - use fallback features instead
    setBranchAmenities([]);
    setAmenitiesLoading(false);
  }, [currentBranchId]);

  // Determine which features to display (branch amenities or fallback)
  const displayFeatures = useMemo(() => {
    return availableFeatures;
  }, []);

  // Determine if a feature is session-based
  const isFeatureSessionBased = (feature: string) => {
    return sessionBasedFeatures.includes(feature);
  };

  const handleCreateAmenity = async () => {
    showErrorToast('Amenity creation not available');
    setCreatingAmenity(false);
    setNewAmenityName('');
    setNewAmenitySessionBased(false);
    setNewAmenityQty(0);
  };

  const handleInputChange = (field: keyof PlanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      clearErrors(field);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => {
      const selected = prev.features.includes(feature);
      const nextFeatures = selected
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature];

      const nextQuantities = { ...prev.featureQuantities };
      if (selected && isFeatureSessionBased(feature)) {
        // Clear quantity when unselecting a session-based feature
        delete nextQuantities[feature];
      }

      return {
        ...prev,
        features: nextFeatures,
        featureQuantities: nextQuantities,
      };
    });
  };

  const handleQuantityChange = (feature: string, value: string) => {
    const qty = Math.max(0, Number(value || 0));
    setFormData(prev => ({
      ...prev,
      featureQuantities: {
        ...prev.featureQuantities,
        [feature]: qty
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      showErrorToast('Please correct the errors in the form');
      return;
    }

    if (!currentBranchId) {
      showErrorToast('Please select a branch before creating a plan');
      return;
    }

    setSubmitting(true);
    try {
      // Convert duration to months as required by backend schema
      const durationNum = Number(formData.duration || 0);
      const durationMonths = (() => {
        switch (formData.durationType) {
          case 'day':
            return Math.max(1, Math.round(durationNum / 30));
          case 'week':
            return Math.max(1, Math.round(durationNum / 4));
          case 'month':
            return Math.max(1, durationNum);
          case 'year':
            return Math.max(1, durationNum * 12);
          default:
            return Math.max(1, durationNum);
        }
      })();

      // Prepare session allotments only for session-based selected features
      const session_allotments: Record<string, number> = {};
      for (const feature of formData.features) {
        if (isFeatureSessionBased(feature)) {
          const qty = formData.featureQuantities[feature] ?? 0;
          if (qty > 0) session_allotments[feature] = qty;
        }
      }

      await membershipService.createPlan({
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        duration_months: durationMonths,
        features: formData.features,
        is_active: formData.isActive,
        branch_id: currentBranchId,
        session_allotments,
      });

      showSuccessToast('Membership plan created successfully');
      navigate('/membership/plans');
    } catch (error) {
      showErrorToast('Failed to create plan. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Branch context banner */}
      <div className={`rounded-md border p-3 ${currentBranchId ? 'bg-muted/30 border-muted' : 'bg-destructive/10 border-destructive'}`}>
        {currentBranchId ? (
          <p className="text-sm">Creating plan for branch: <span className="font-medium">{currentBranchId}</span></p>
        ) : (
          <p className="text-sm text-destructive">No branch selected. Please select a branch to create this plan.</p>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Define the core details of the membership plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={() => validateField('name', formData.name)}
                placeholder="e.g., Premium Membership"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">{symbol}</span>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                onBlur={() => validateField('price', formData.price)}
                placeholder="99.99"
                className={`pl-8 ${errors.price ? 'border-destructive' : ''}`}
              />
            </div>
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <div className="flex space-x-2">
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  onBlur={() => validateField('duration', formData.duration)}
                  placeholder="1"
                  className={`flex-1 ${errors.duration ? 'border-destructive' : ''}`}
                />
                <Select onValueChange={(value) => handleInputChange('durationType', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day(s)</SelectItem>
                    <SelectItem value="week">Week(s)</SelectItem>
                    <SelectItem value="month">Month(s)</SelectItem>
                    <SelectItem value="year">Year(s)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxMembers">Member Limit</Label>
              <Input
                id="maxMembers"
                type="number"
                value={formData.maxMembers}
                onChange={(e) => handleInputChange('maxMembers', e.target.value)}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                onBlur={() => validateField('description', formData.description)}
                placeholder="Describe what this membership plan includes"
                rows={3}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access & Benefits</CardTitle>
          <CardDescription>Configure what this plan includes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accessHours">Access Hours</Label>
              <Select onValueChange={(value) => handleInputChange('accessHours', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select access hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24/7">24/7 Access</SelectItem>
                  <SelectItem value="6AM-10PM">6 AM - 10 PM</SelectItem>
                  <SelectItem value="5AM-11PM">5 AM - 11 PM</SelectItem>
                  <SelectItem value="Business">Business Hours Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="personalTrainerSessions">Personal Training Sessions</Label>
              <Input
                id="personalTrainerSessions"
                type="number"
                value={formData.personalTrainerSessions}
                onChange={(e) => handleInputChange('personalTrainerSessions', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestPasses">Guest Passes per Month</Label>
              <Input
                id="guestPasses"
                type="number"
                value={formData.guestPasses}
                onChange={(e) => handleInputChange('guestPasses', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="groupClassAccess"
                  checked={formData.groupClassAccess}
                  onCheckedChange={(checked) => handleInputChange('groupClassAccess', checked)}
                />
                <Label htmlFor="groupClassAccess">Group Class Access</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lockerAccess"
                  checked={formData.lockerAccess}
                  onCheckedChange={(checked) => handleInputChange('lockerAccess', checked)}
                />
                <Label htmlFor="lockerAccess">Locker Room Access</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Plan Active</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features & Amenities</CardTitle>
          <CardDescription>Select the features included in this plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end rounded-md border p-3">
            <div className="space-y-1">
              <Label htmlFor="new-amenity-name">Add Amenity (branch-specific)</Label>
              <Input
                id="new-amenity-name"
                placeholder="e.g., Steam bath"
                value={newAmenityName}
                onChange={(e) => setNewAmenityName(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="new-amenity-session"
                checked={newAmenitySessionBased}
                onCheckedChange={(v) => setNewAmenitySessionBased(!!v)}
              />
              <Label htmlFor="new-amenity-session">Session-based</Label>
              {newAmenitySessionBased && (
                <div className="ml-auto flex items-center gap-2">
                  <Label htmlFor="new-amenity-qty" className="text-xs text-muted-foreground">Default Qty</Label>
                  <Input
                    id="new-amenity-qty"
                    type="number"
                    min={0}
                    className="h-8 w-24"
                    value={newAmenityQty}
                    onChange={(e) => setNewAmenityQty(Math.max(0, Number(e.target.value || 0)))}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={handleCreateAmenity} disabled={creatingAmenity || !newAmenityName.trim()}>
                {creatingAmenity ? 'Adding...' : 'Add Amenity'}
              </Button>
            </div>
          </div>
          {amenitiesLoading && (
            <p className="text-sm text-muted-foreground mb-2">Loading branch amenities...</p>
          )}
          {!amenitiesLoading && branchAmenities && branchAmenities.length === 0 && (
            <p className="text-sm text-muted-foreground mb-2">No branch-specific amenities configured. Showing default options.</p>
          )}
          {!amenitiesLoading && branchAmenities && branchAmenities.length > 0 && (
            <p className="text-sm text-muted-foreground mb-2">Loaded {branchAmenities.length} amenities for this branch.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayFeatures.map((feature) => {
              const selected = formData.features.includes(feature);
              const isSessionBased = isFeatureSessionBased(feature);
              return (
                <div key={feature} className="flex items-center gap-2">
                  <Checkbox
                    id={feature}
                    checked={selected}
                    onCheckedChange={() => handleFeatureToggle(feature)}
                  />
                  <Label htmlFor={feature} className="text-sm">
                    {feature}
                  </Label>
                  {selected && isSessionBased && (
                    <div className="ml-auto flex items-center gap-2">
                      <Label htmlFor={`${feature}-qty`} className="text-xs text-muted-foreground">Qty</Label>
                      <Input
                        id={`${feature}-qty`}
                        type="number"
                        min={0}
                        className="h-8 w-20"
                        value={formData.featureQuantities[feature] ?? 0}
                        onChange={(e) => handleQuantityChange(feature, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            Tip: For session-based amenities like Yoga, set the quantity to control how many sessions are allotted for this plan.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/membership/plans')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
}
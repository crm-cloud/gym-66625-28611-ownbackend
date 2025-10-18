import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Users, Mail, Phone, MapPin, Award } from 'lucide-react';
import { useBranches } from '@/hooks/useSupabaseQuery';
import { useCreateTrainer } from '@/hooks/useTrainers';
import type { TrainerSpecialty } from '@/types/trainer';

const quickTrainerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  branch_id: z.string().uuid('Please select a branch'),
  specialization: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
  profile_photo: z.string().optional(),
});

type QuickTrainerFormData = z.infer<typeof quickTrainerSchema>;

interface QuickTrainerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (trainerId: string) => void;
}

const specializations: { value: TrainerSpecialty; label: string }[] = [
  { value: 'strength_training', label: 'Strength Training' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'pilates', label: 'Pilates' },
  { value: 'crossfit', label: 'CrossFit' },
  { value: 'martial_arts', label: 'Martial Arts' },
  { value: 'dance', label: 'Dance' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'rehabilitation', label: 'Rehabilitation' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'bodybuilding', label: 'Bodybuilding' },
  { value: 'sports_performance', label: 'Sports Performance' },
  { value: 'senior_fitness', label: 'Senior Fitness' },
  { value: 'youth_fitness', label: 'Youth Fitness' },
];

export const QuickTrainerForm = ({ open, onOpenChange, onSuccess }: QuickTrainerFormProps) => {
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const { data: branches = [] } = useBranches();
  const createTrainer = useCreateTrainer();

  const form = useForm<QuickTrainerFormData>({
    resolver: zodResolver(quickTrainerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      branch_id: '',
      specialization: [],
      is_active: true,
    },
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotoPreview(result);
        form.setValue('profile_photo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSpecialization = (spec: string) => {
    const updated = selectedSpecializations.includes(spec)
      ? selectedSpecializations.filter(s => s !== spec)
      : [...selectedSpecializations, spec];
    
    setSelectedSpecializations(updated);
    form.setValue('specialization', updated);
  };

  const onSubmit = async (data: QuickTrainerFormData) => {
    try {
      const trainerId = await createTrainer.mutateAsync({
        ...data,
        role: 'trainer' as const,
        specialties: (data.specialization || []) as TrainerSpecialty[],
      });
      
      onSuccess(trainerId);
      onOpenChange(false);
      form.reset();
      setSelectedSpecializations([]);
      setPhotoPreview('');
    } catch (error) {
      console.error('Failed to create trainer:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-primary" />
            Quick Add Trainer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={photoPreview} />
              <AvatarFallback className="bg-muted">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <Label htmlFor="photo-upload" className="cursor-pointer">
              <Button type="button" variant="outline" size="sm" asChild>
                <span>Upload Photo</span>
              </Button>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </Label>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Full Name *
              </Label>
              <Input
                id="full_name"
                {...form.register('full_name')}
                placeholder="Enter full name"
                className="bg-background border-border"
              />
              {form.formState.errors.full_name && (
                <p className="text-sm text-destructive">{form.formState.errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="trainer@gym.com"
                className="bg-background border-border"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Phone *
              </Label>
              <Input
                id="phone"
                {...form.register('phone')}
                placeholder="+1 234 567 8900"
                className="bg-background border-border"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch_id" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Branch *
              </Label>
              <Select onValueChange={(value) => form.setValue('branch_id', value)}>
                <SelectTrigger className="bg-background border-border">
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
              {form.formState.errors.branch_id && (
                <p className="text-sm text-destructive">{form.formState.errors.branch_id.message}</p>
              )}
            </div>
          </div>

          {/* Specializations */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Specializations (Optional)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {specializations.map((spec) => (
                <Button
                  key={spec.value}
                  type="button"
                  variant={selectedSpecializations.includes(spec.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSpecialization(spec.value)}
                  className="justify-start text-xs"
                >
                  {spec.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Trainer Status</Label>
              <p className="text-xs text-muted-foreground">
                Set trainer as active to allow bookings
              </p>
            </div>
            <Switch
              checked={form.watch('is_active')}
              onCheckedChange={(checked) => form.setValue('is_active', checked)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTrainer.isPending}
            >
              {createTrainer.isPending ? 'Creating...' : 'Create Trainer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { BiometricDevice } from '@/types/attendance';
import { useBranches } from '@/hooks/useBranches';

const deviceSchema = z.object({
  name: z.string().min(1, 'Device name is required'),
  model: z.string().min(1, 'Model is required'),
  ipAddress: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP address'),
  location: z.string().min(1, 'Location is required'),
  branchId: z.string().min(1, 'Branch is required'),
  syncInterval: z.number().min(1).max(60),
  autoApproval: z.boolean(),
  requirePhoto: z.boolean(),
  workingHoursStart: z.string(),
  workingHoursEnd: z.string(),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

interface DeviceFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (device: Omit<BiometricDevice, 'id'>) => void;
  device?: BiometricDevice;
}

export const DeviceForm = ({ open, onClose, onSubmit, device }: DeviceFormProps) => {
  const { branches } = useBranches();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: device ? {
      name: device.name,
      model: device.model,
      ipAddress: device.ipAddress,
      location: device.location,
      branchId: device.branchId,
      syncInterval: device.settings.syncInterval,
      autoApproval: device.settings.autoApproval,
      requirePhoto: device.settings.requirePhoto,
      workingHoursStart: device.settings.workingHours.start,
      workingHoursEnd: device.settings.workingHours.end,
    } : {
      syncInterval: 15,
      autoApproval: true,
      requirePhoto: false,
      workingHoursStart: '06:00',
      workingHoursEnd: '23:00',
    },
  });

  const selectedBranchId = watch('branchId');
  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  const onFormSubmit = async (data: DeviceFormData) => {
    setIsSubmitting(true);
    try {
      const newDevice: Omit<BiometricDevice, 'id'> = {
        name: data.name,
        model: data.model,
        ipAddress: data.ipAddress,
        location: data.location,
        branchId: data.branchId,
        branchName: selectedBranch?.name || '',
        status: 'offline',
        lastSync: new Date(),
        totalRecords: 0,
        isActive: true,
        settings: {
          syncInterval: data.syncInterval,
          autoApproval: data.autoApproval,
          requirePhoto: data.requirePhoto,
          workingHours: {
            start: data.workingHoursStart,
            end: data.workingHoursEnd,
          },
        },
      };
      onSubmit(newDevice);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {device ? 'Edit Device' : 'Add New Device'}
          </DialogTitle>
          <DialogDescription>
            Configure biometric device settings and connection details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Device Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Main Entrance Scanner"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                {...register('model')}
                placeholder="Hikvision DS-K1T341A"
              />
              {errors.model && (
                <p className="text-sm text-destructive">{errors.model.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                {...register('ipAddress')}
                placeholder="192.168.1.100"
              />
              {errors.ipAddress && (
                <p className="text-sm text-destructive">{errors.ipAddress.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Main Entrance"
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branchId">Branch</Label>
            <Select onValueChange={(value) => setValue('branchId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.branchId && (
              <p className="text-sm text-destructive">{errors.branchId.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Device Settings</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
                <Input
                  id="syncInterval"
                  type="number"
                  min="1"
                  max="60"
                  {...register('syncInterval', { valueAsNumber: true })}
                />
                {errors.syncInterval && (
                  <p className="text-sm text-destructive">{errors.syncInterval.message}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoApproval"
                    {...register('autoApproval')}
                    onCheckedChange={(checked) => setValue('autoApproval', checked)}
                  />
                  <Label htmlFor="autoApproval">Auto Approval</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="requirePhoto"
                    {...register('requirePhoto')}
                    onCheckedChange={(checked) => setValue('requirePhoto', checked)}
                  />
                  <Label htmlFor="requirePhoto">Require Photo</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workingHoursStart">Working Hours Start</Label>
                <Input
                  id="workingHoursStart"
                  type="time"
                  {...register('workingHoursStart')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHoursEnd">Working Hours End</Label>
                <Input
                  id="workingHoursEnd"
                  type="time"
                  {...register('workingHoursEnd')}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : device ? 'Update Device' : 'Add Device'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
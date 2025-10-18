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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BiometricDevice } from '@/types/attendance';
import { toast } from '@/hooks/use-toast';
import { Settings, Wifi, Clock, Camera, Shield } from 'lucide-react';

const settingsSchema = z.object({
  syncInterval: z.number().min(1).max(60),
  autoApproval: z.boolean(),
  requirePhoto: z.boolean(),
  workingHoursStart: z.string(),
  workingHoursEnd: z.string(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface DeviceSettingsDialogProps {
  device: BiometricDevice;
  open: boolean;
  onClose: () => void;
  onSave: (device: BiometricDevice) => void;
}

export const DeviceSettingsDialog = ({ device, open, onClose, onSave }: DeviceSettingsDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      syncInterval: device.settings.syncInterval,
      autoApproval: device.settings.autoApproval,
      requirePhoto: device.settings.requirePhoto,
      workingHoursStart: device.settings.workingHours.start,
      workingHoursEnd: device.settings.workingHours.end,
    },
  });

  const handleTestConnection = async () => {
    toast({
      title: "Testing Connection",
      description: `Testing connection to ${device.name}...`,
    });

    // Simulate connection test
    setTimeout(() => {
      toast({
        title: "Connection Test",
        description: device.status === 'online' 
          ? "Connection successful!" 
          : "Connection failed. Please check device status.",
        variant: device.status === 'online' ? 'default' : 'destructive',
      });
    }, 2000);
  };

  const handleSyncNow = async () => {
    toast({
      title: "Syncing Device",
      description: `Syncing ${device.name}...`,
    });

    // Simulate sync
    setTimeout(() => {
      toast({
        title: "Sync Complete",
        description: "Device has been synced successfully.",
      });
    }, 3000);
  };

  const onFormSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    try {
      const updatedDevice: BiometricDevice = {
        ...device,
        settings: {
          syncInterval: data.syncInterval,
          autoApproval: data.autoApproval,
          requirePhoto: data.requirePhoto,
          workingHours: {
            start: data.workingHoursStart,
            end: data.workingHoursEnd,
          },
        },
        lastSync: new Date(),
      };
      onSave(updatedDevice);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'offline':
        return 'text-red-500';
      case 'maintenance':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {device.name} Settings
          </DialogTitle>
          <DialogDescription>
            Configure device settings and view connection details.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="syncInterval">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Sync Interval (minutes)
                  </Label>
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
                      checked={watch('autoApproval')}
                      onCheckedChange={(checked) => setValue('autoApproval', checked)}
                    />
                    <Label htmlFor="autoApproval" className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      Auto Approval
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requirePhoto"
                      checked={watch('requirePhoto')}
                      onCheckedChange={(checked) => setValue('requirePhoto', checked)}
                    />
                    <Label htmlFor="requirePhoto" className="flex items-center gap-1">
                      <Camera className="h-4 w-4" />
                      Require Photo
                    </Label>
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
            </form>
          </TabsContent>

          <TabsContent value="connection" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Device Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Wifi className={`h-4 w-4 ${getStatusColor(device.status)}`} />
                    <Badge variant={device.status === 'online' ? 'default' : 'destructive'}>
                      {device.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Last Sync</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {device.lastSync ? new Date(device.lastSync).toLocaleString() : 'Never'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Connection Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">IP Address:</span>
                  <span className="text-sm">{device.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Model:</span>
                  <span className="text-sm">{device.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <span className="text-sm">{device.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Records:</span>
                  <span className="text-sm">{device.totalRecords}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleTestConnection}>
                Test Connection
              </Button>
              <Button variant="outline" onClick={handleSyncNow}>
                Sync Now
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Device Actions</CardTitle>
                <CardDescription>
                  Perform maintenance operations on the device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <div className="text-sm font-medium">Restart Device</div>
                    <div className="text-xs text-muted-foreground">
                      Restart the biometric device
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <div className="text-sm font-medium">Clear Cache</div>
                    <div className="text-xs text-muted-foreground">
                      Clear device cache and temporary data
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <div className="text-sm font-medium">Download Logs</div>
                    <div className="text-xs text-muted-foreground">
                      Download device operation logs
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <div className="text-sm font-medium">Factory Reset</div>
                    <div className="text-xs text-muted-foreground">
                      Reset device to factory settings
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {activeTab === 'settings' && (
            <Button onClick={handleSubmit(onFormSubmit)} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
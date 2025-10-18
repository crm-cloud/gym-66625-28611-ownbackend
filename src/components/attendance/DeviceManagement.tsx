import { useState } from 'react';
import { Plus, Settings, Wifi, WifiOff, AlertTriangle, RotateCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DataTable } from '@/components/ui/data-table';
import { DeviceForm } from './DeviceForm';
import { DeviceSettingsDialog } from './DeviceSettingsDialog';
import { BiometricDevice } from '@/types/attendance';
import { toast } from '@/hooks/use-toast';
import { PermissionGate } from '@/components/PermissionGate';

export const DeviceManagement = () => {
  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<BiometricDevice | null>(null);

  const handleDeviceStatusToggle = (deviceId: string) => {
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? { ...device, isActive: !device.isActive }
        : device
    ));
    toast({
      title: "Device Status Updated",
      description: "Device status has been changed successfully.",
    });
  };

  const handleDeviceSync = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      // Simulate sync
      setDevices(devices.map(d => 
        d.id === deviceId 
          ? { ...d, lastSync: new Date() }
          : d
      ));
      toast({
        title: "Device Synced",
        description: `${device.name} has been synced successfully.`,
      });
    }
  };

  const handleDeviceRestart = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      toast({
        title: "Device Restart Initiated",
        description: `Restart command sent to ${device.name}.`,
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'online':
        return 'default';
      case 'offline':
        return 'destructive';
      case 'maintenance':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Device Name',
    },
    {
      accessorKey: 'model',
      header: 'Model',
    },
    {
      accessorKey: 'location',
      header: 'Location',
    },
    {
      accessorKey: 'branchName',
      header: 'Branch',
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP Address',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => {
        const status = row.getValue('status') as string;
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <Badge variant={getStatusBadgeVariant(status)}>
              {status}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'totalRecords',
      header: 'Records',
    },
    {
      accessorKey: 'lastSync',
      header: 'Last Sync',
      cell: ({ row }: { row: any }) => {
        const date = row.getValue('lastSync') as Date;
        return date ? new Date(date).toLocaleString() : 'Never';
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Active',
      cell: ({ row }: { row: any }) => {
        const device = row.original as BiometricDevice;
        return (
          <PermissionGate permission="devices.edit">
            <Switch
              checked={device.isActive}
              onCheckedChange={() => handleDeviceStatusToggle(device.id)}
            />
          </PermissionGate>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => {
        const device = row.original as BiometricDevice;
        return (
          <div className="flex items-center gap-2">
            <PermissionGate permission="devices.sync">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeviceSync(device.id)}
                disabled={device.status === 'offline'}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </PermissionGate>
            <PermissionGate permission="devices.settings">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDevice(device);
                  setShowSettingsDialog(true);
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PermissionGate>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Device Management</h1>
          <p className="text-muted-foreground">
            Manage biometric devices and attendance scanners
          </p>
        </div>
        <PermissionGate permission="devices.create">
          <Button onClick={() => setShowDeviceForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Device
          </Button>
        </PermissionGate>
      </div>

      {/* Device Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Wifi className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {devices.filter(d => d.status === 'online').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <WifiOff className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {devices.filter(d => d.status === 'offline').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {devices.filter(d => d.status === 'maintenance').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Devices</CardTitle>
          <CardDescription>
            Manage all biometric devices and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={devices} />
        </CardContent>
      </Card>

      {/* Device Form Dialog */}
      {showDeviceForm && (
        <DeviceForm
          open={showDeviceForm}
          onClose={() => setShowDeviceForm(false)}
          onSubmit={(device) => {
            setDevices([...devices, { ...device, id: `device-${Date.now()}` }]);
            setShowDeviceForm(false);
            toast({
              title: "Device Added",
              description: "New device has been added successfully.",
            });
          }}
        />
      )}

      {/* Device Settings Dialog */}
      {showSettingsDialog && selectedDevice && (
        <DeviceSettingsDialog
          device={selectedDevice}
          open={showSettingsDialog}
          onClose={() => {
            setShowSettingsDialog(false);
            setSelectedDevice(null);
          }}
          onSave={(updatedDevice) => {
            setDevices(devices.map(d => 
              d.id === updatedDevice.id ? updatedDevice : d
            ));
            setShowSettingsDialog(false);
            setSelectedDevice(null);
            toast({
              title: "Settings Saved",
              description: "Device settings have been updated successfully.",
            });
          }}
        />
      )}
    </div>
  );
};
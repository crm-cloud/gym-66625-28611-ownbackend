import { DeviceManagement } from '@/components/attendance/DeviceManagement';
import { RouteGuard } from '@/components/RouteGuard';

export default function AttendanceDevicesPage() {
  return (
    <RouteGuard requiredPermissions={['devices.view']}>
      <DeviceManagement />
    </RouteGuard>
  );
}
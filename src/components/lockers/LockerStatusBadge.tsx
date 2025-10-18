import { Badge } from '@/components/ui/badge';
import { LockerStatus } from '@/types/locker';

interface LockerStatusBadgeProps {
  status: LockerStatus;
}

export function LockerStatusBadge({ status }: LockerStatusBadgeProps) {
  const getStatusConfig = (status: LockerStatus) => {
    switch (status) {
      case 'available':
        return { 
          variant: 'default' as const, 
          label: 'Available',
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
        };
      case 'occupied':
        return { 
          variant: 'destructive' as const, 
          label: 'Occupied',
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
        };
      case 'maintenance':
        return { 
          variant: 'secondary' as const, 
          label: 'Maintenance',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
        };
      case 'reserved':
        return { 
          variant: 'outline' as const, 
          label: 'Reserved',
          className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
        };
      default:
        return { 
          variant: 'default' as const, 
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
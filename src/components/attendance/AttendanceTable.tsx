import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Clock, 
  User, 
  MapPin, 
  Smartphone, 
  CreditCard, 
  Fingerprint, 
  PenTool,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock3,
  MoreHorizontal,
  Eye,
  Edit,
  MessageSquare
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AttendanceRecord } from '@/types/attendance';
import { cn } from '@/lib/utils';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  isLoading?: boolean;
  onViewDetails?: (record: AttendanceRecord) => void;
  onEditRecord?: (record: AttendanceRecord) => void;
  onAddNote?: (record: AttendanceRecord) => void;
}

export const AttendanceTable = ({
  records,
  isLoading = false,
  onViewDetails,
  onEditRecord,
  onAddNote
}: AttendanceTableProps) => {
  const [sortField, setSortField] = useState<keyof AttendanceRecord>('checkInTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof AttendanceRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedRecords = [...records].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === bValue) return 0;
    
    const comparison = aValue > bValue ? 1 : -1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getStatusIcon = (status: string, isLate: boolean) => {
    if (isLate) {
      return <AlertCircle className="w-4 h-4 text-warning" />;
    }
    
    switch (status) {
      case 'checked-in':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'checked-out':
        return <CheckCircle className="w-4 h-4 text-muted-foreground" />;
      case 'no-show':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock3 className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string, isLate: boolean) => {
    if (isLate) {
      return <Badge variant="destructive" className="text-xs">Late</Badge>;
    }
    
    switch (status) {
      case 'checked-in':
        return <Badge variant="default" className="text-xs bg-success text-success-foreground">Active</Badge>;
      case 'checked-out':
        return <Badge variant="secondary" className="text-xs">Completed</Badge>;
      case 'no-show':
        return <Badge variant="destructive" className="text-xs">No Show</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getEntryMethodIcon = (method: string) => {
    switch (method) {
      case 'biometric':
        return <Fingerprint className="w-4 h-4 text-primary" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4 text-blue-600" />;
      case 'card':
        return <CreditCard className="w-4 h-4 text-green-600" />;
      case 'manual':
        return <PenTool className="w-4 h-4 text-orange-600" />;
      default:
        return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'member':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'trainer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'staff':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return 'Active';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No attendance records found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or date range.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead 
                className="cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('userName')}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  User
                </div>
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('checkInTime')}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Check In
                </div>
              </TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRecords.map((record) => (
              <TableRow 
                key={record.id} 
                className={cn(
                  "hover:bg-muted/50 transition-colors",
                  record.isLate && "bg-warning/5 border-l-4 border-l-warning"
                )}
              >
                {/* User Info */}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${record.userName}`} />
                      <AvatarFallback className="text-xs">
                        {record.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-foreground">{record.userName}</div>
                      <div className="text-xs text-muted-foreground">{record.userEmail}</div>
                    </div>
                  </div>
                </TableCell>

                {/* Role */}
                <TableCell>
                  <Badge className={cn("text-xs capitalize", getRoleBadgeColor(record.userRole))}>
                    {record.userRole}
                  </Badge>
                </TableCell>

                {/* Check In Time */}
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-sm">
                      {format(record.checkInTime, 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(record.checkInTime, 'h:mm a')}
                    </div>
                  </div>
                </TableCell>

                {/* Check Out Time */}
                <TableCell>
                  {record.checkOutTime ? (
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {format(record.checkOutTime, 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(record.checkOutTime, 'h:mm a')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">-</div>
                  )}
                </TableCell>

                {/* Duration */}
                <TableCell>
                  <div className="font-medium text-sm">
                    {formatDuration(record.duration || 0)}
                  </div>
                </TableCell>

                {/* Entry Method */}
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        {getEntryMethodIcon(record.entryMethod)}
                        <span className="text-sm capitalize">{record.entryMethod}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <div>Method: {record.entryMethod}</div>
                        {record.deviceId && <div>Device: {record.deviceId}</div>}
                        {record.deviceLocation && <div>Location: {record.deviceLocation}</div>}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>

                {/* Location */}
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate max-w-32">{record.branchName}</span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(record.status, record.isLate)}
                    {getStatusBadge(record.status, record.isLate)}
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={() => onViewDetails?.(record)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onEditRecord?.(record)}
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Record
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onAddNote?.(record)}
                        className="gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Add Note
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};
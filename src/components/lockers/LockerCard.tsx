import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal, User, Settings, Key, UserMinus, Trash, MapPin, DollarSign, Calendar, FileText, Users, AlertTriangle } from 'lucide-react';
import { Locker } from '@/types/locker';
import { LockerStatusBadge } from './LockerStatusBadge';
import { PermissionGate } from '@/components/PermissionGate';
import { useState } from 'react';

interface LockerCardProps {
  locker: Locker;
  onAssign?: (locker: Locker) => void;
  onRelease?: (locker: Locker) => void;
  onEdit?: (locker: Locker) => void;
  onDelete?: (lockerId: string) => void;
}

export function LockerCard({ 
  locker, 
  onAssign, 
  onRelease, 
  onEdit, 
  onDelete 
}: LockerCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'border-l-green-500 bg-green-50/30';
      case 'occupied': return 'border-l-red-500 bg-red-50/30';
      case 'maintenance': return 'border-l-yellow-500 bg-yellow-50/30';
      case 'reserved': return 'border-l-blue-500 bg-blue-50/30';
      default: return 'border-l-gray-500 bg-gray-50/30';
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(locker.id);
      setShowDeleteDialog(false);
    }
  };

  const handleRelease = () => {
    if (onRelease) {
      onRelease(locker);
      setShowReleaseDialog(false);
    }
  };

  return (
    <>
      <Card className={`hover:shadow-md transition-all duration-200 border-l-4 ${getStatusColor(locker.status)} hover:scale-[1.02]`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">{locker.number}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <LockerStatusBadge status={locker.status} />
              <PermissionGate permission="lockers.edit">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {locker.status === 'available' && onAssign && (
                      <DropdownMenuItem onClick={() => onAssign(locker)}>
                        <Users className="mr-2 h-4 w-4" />
                        Assign Locker
                      </DropdownMenuItem>
                    )}
                    {locker.status === 'occupied' && onRelease && (
                      <DropdownMenuItem onClick={() => setShowReleaseDialog(true)}>
                        <UserMinus className="mr-2 h-4 w-4" />
                        Release Locker
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(locker)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Edit Locker
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {onDelete && (
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)} 
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Locker
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </PermissionGate>
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-medium">{locker.name}</p>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{locker.branchName}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Key className="w-4 h-4 text-muted-foreground" />
            <span>{locker.size.name} ({locker.size.dimensions})</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-green-600">${locker.monthlyFee}/month</span>
          </div>
          
          {locker.assignedMemberName && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{locker.assignedMemberName}</span>
            </div>
          )}
          
          {locker.assignedDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Since {new Date(locker.assignedDate).toLocaleDateString()}</span>
            </div>
          )}
          
          {locker.expirationDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className={
                new Date(locker.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  ? 'text-red-600 font-medium'
                  : 'text-muted-foreground'
              }>
                Expires {new Date(locker.expirationDate).toLocaleDateString()}
                {new Date(locker.expirationDate) < new Date() && ' (Expired)'}
                {new Date(locker.expirationDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && 
                 new Date(locker.expirationDate) >= new Date() && ' (Soon)'}
              </span>
              {new Date(locker.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
            </div>
          )}
          
          {locker.notes && (
            <div className="flex items-start gap-2 text-sm">
              <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{locker.notes}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Locker</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete locker {locker.number}? This action cannot be undone.
              {locker.status === 'occupied' && (
                <span className="block mt-2 text-red-600 font-medium">
                  Warning: This locker is currently occupied by {locker.assignedMemberName}.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Release Confirmation Dialog */}
      <AlertDialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release Locker</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to release locker {locker.number} from {locker.assignedMemberName}?
              This will make the locker available for assignment to other members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRelease}>
              Release Locker
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
import { format, isAfter, isBefore, addHours, differenceInMinutes } from 'date-fns';
import { 
  Clock, 
  Users, 
  MapPin, 
  User, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GymClass, ClassTag } from '@/types/class';
import { classTagLabels } from '@/hooks/useClasses';
import { useRBAC } from '@/hooks/useRBAC';

interface ClassCardProps {
  gymClass: GymClass;
  onEnroll?: (classId: string) => void;
  onCancel?: (classId: string) => void;
  onEdit?: (classId: string) => void;
  onViewDetails?: (classId: string) => void;
  showActions?: boolean;
  isEnrolled?: boolean;
  userRole?: 'admin' | 'trainer' | 'member' | 'staff';
}

const getClassStatusInfo = (gymClass: GymClass) => {
  const now = new Date();
  const isUpcoming = isAfter(gymClass.startTime, now);
  const isOngoing = !isUpcoming && isBefore(now, gymClass.endTime);
  const isCompleted = isAfter(now, gymClass.endTime);
  
  if (gymClass.status === 'cancelled') {
    return {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      label: 'Cancelled'
    };
  }
  
  if (isCompleted) {
    return {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      label: 'Completed'
    };
  }
  
  if (isOngoing) {
    return {
      icon: AlertCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      label: 'In Progress'
    };
  }
  
  return {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Upcoming'
  };
};

const getTagColor = (tag: ClassTag) => {
  const colors = {
    'strength': 'bg-red-100 text-red-800',
    'cardio': 'bg-orange-100 text-orange-800',
    'flexibility': 'bg-green-100 text-green-800',
    'dance': 'bg-pink-100 text-pink-800',
    'martial-arts': 'bg-purple-100 text-purple-800',
    'water': 'bg-blue-100 text-blue-800',
    'mind-body': 'bg-indigo-100 text-indigo-800'
  };
  return colors[tag] || 'bg-gray-100 text-gray-800';
};

export const ClassCard = ({
  gymClass,
  onEnroll,
  onCancel,
  onEdit,
  onViewDetails,
  showActions = true,
  isEnrolled = false,
  userRole = 'member'
}: ClassCardProps) => {
  const { hasPermission } = useRBAC();
  const statusInfo = getClassStatusInfo(gymClass);
  const StatusIcon = statusInfo.icon;
  
  const duration = differenceInMinutes(gymClass.endTime, gymClass.startTime);
  const availableSpots = gymClass.capacity - gymClass.enrolledCount;
  const isFull = availableSpots <= 0;
  const isUpcoming = isAfter(gymClass.startTime, new Date());
  
  const canEnroll = isUpcoming && !isFull && !isEnrolled && userRole === 'member';
  const canCancel = isUpcoming && isEnrolled && userRole === 'member';
  const canEdit = hasPermission('classes.edit') && (userRole === 'admin' || userRole === 'staff');

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{gymClass.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {gymClass.description}
            </p>
          </div>
          <Badge 
            variant="secondary" 
            className={`${statusInfo.bgColor} ${statusInfo.color} hover:${statusInfo.bgColor}`}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Time and Duration */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{format(gymClass.startTime, 'MMM dd, h:mm a')}</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <span>{duration} min</span>
        </div>

        {/* Trainer */}
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{gymClass.trainerName}</span>
        </div>

        {/* Branch */}
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{gymClass.branchName}</span>
        </div>

        {/* Capacity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {gymClass.enrolledCount}/{gymClass.capacity} enrolled
            </span>
          </div>
          {isFull && (
            <Badge variant="destructive" className="text-xs">
              Full
            </Badge>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {gymClass.tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="outline" 
              className={`text-xs ${getTagColor(tag)}`}
            >
              {classTagLabels[tag]}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 pt-2">
            {canEnroll && onEnroll && (
              <Button 
                size="sm" 
                onClick={() => onEnroll(gymClass.id)}
                className="flex-1"
              >
                Register
              </Button>
            )}
            
            {canCancel && onCancel && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onCancel(gymClass.id)}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            
            {isEnrolled && !canCancel && (
              <Button 
                size="sm" 
                variant="secondary"
                disabled
                className="flex-1"
              >
                Enrolled
              </Button>
            )}
            
            {!canEnroll && !canCancel && !isEnrolled && userRole === 'member' && (
              <Button 
                size="sm" 
                variant="outline"
                disabled
                className="flex-1"
              >
                {isFull ? 'Class Full' : 'Unavailable'}
              </Button>
            )}

            {onViewDetails && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onViewDetails(gymClass.id)}
              >
                View
              </Button>
            )}
            
            {canEdit && onEdit && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onEdit(gymClass.id)}
              >
                Edit
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
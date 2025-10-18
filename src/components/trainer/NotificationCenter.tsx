
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Calendar, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Star,
  TrendingUp,
  X,
  Settings
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'assignment' | 'reminder' | 'cancellation' | 'feedback' | 'performance' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedId?: string;
  actionUrl?: string;
  avatarUrl?: string;
}

interface NotificationCenterProps {
  trainerId?: string;
  className?: string;
}

const mockNotifications: Notification[] = [
  {
    id: 'notif_001',
    type: 'assignment',
    title: 'New Session Assignment',
    message: 'You have been assigned a strength training session with Sarah Johnson for tomorrow at 2:00 PM.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false,
    priority: 'high',
    relatedId: 'assignment_001',
    actionUrl: '/schedule',
    avatarUrl: '/placeholder-avatar.jpg'
  },
  {
    id: 'notif_002',
    type: 'reminder',
    title: 'Upcoming Session Reminder',
    message: 'Your cardio session with Mike Wilson starts in 1 hour.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isRead: false,
    priority: 'medium',
    relatedId: 'assignment_002'
  },
  {
    id: 'notif_003',
    type: 'feedback',
    title: 'New Client Feedback',
    message: 'Emma Davis left a 5-star review for your yoga session yesterday.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: true,
    priority: 'low',
    relatedId: 'feedback_001'
  },
  {
    id: 'notif_004',
    type: 'performance',
    title: 'Performance Alert',
    message: 'Your utilization rate is 92% this week - consider adjusting your availability.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isRead: false,
    priority: 'medium'
  },
  {
    id: 'notif_005',
    type: 'cancellation',
    title: 'Session Cancelled',
    message: 'John Smith cancelled his pilates session scheduled for Friday 3:00 PM.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    isRead: true,
    priority: 'medium',
    relatedId: 'assignment_003'
  }
];

export const NotificationCenter = ({ trainerId, className = "" }: NotificationCenterProps) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'assignments' | 'reminders'>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'assignment': return <User className="h-4 w-4" />;
      case 'reminder': return <Clock className="h-4 w-4" />;
      case 'cancellation': return <X className="h-4 w-4" />;
      case 'feedback': return <Star className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-200';
      case 'medium': return 'bg-yellow-100 border-yellow-200';
      case 'low': return 'bg-blue-100 border-blue-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast({
      title: "All notifications marked as read",
      description: "Your notification center has been updated.",
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.isRead;
      case 'assignments': return notification.type === 'assignment';
      case 'reminders': return notification.type === 'reminder';
      default: return true;
    }
  });

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'assignments', label: 'Assignments' },
              { key: 'reminders', label: 'Reminders' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(key as any)}
              >
                {label}
                {key === 'unread' && unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      !notification.isRead 
                        ? getPriorityColor(notification.priority)
                        : 'bg-muted/30 border-muted'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {notification.avatarUrl ? (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={notification.avatarUrl} />
                          <AvatarFallback>
                            {getNotificationIcon(notification.type)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="p-2 bg-background rounded-full">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                          
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

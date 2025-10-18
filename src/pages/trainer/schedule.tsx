
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PermissionGate } from '@/components/PermissionGate';

export default function TrainerSchedulePage() {
  const { authState } = useAuth();

  const todaysSessions = [
    { id: 1, time: '09:00 AM', client: 'Sarah Johnson', type: 'Strength Training', duration: '60 min', status: 'upcoming' },
    { id: 2, time: '10:30 AM', client: 'Mike Chen', type: 'HIIT Workout', duration: '45 min', status: 'current' },
    { id: 3, time: '02:00 PM', client: 'Lisa Rodriguez', type: 'Cardio & Core', duration: '60 min', status: 'upcoming' },
    { id: 4, time: '03:30 PM', client: 'David Kim', type: 'Functional Training', duration: '45 min', status: 'upcoming' }
  ];

  const weeklySchedule = [
    { day: 'Monday', sessions: 6, hours: 5.5 },
    { day: 'Tuesday', sessions: 4, hours: 4 },
    { day: 'Wednesday', sessions: 5, hours: 4.5 },
    { day: 'Thursday', sessions: 7, hours: 6 },
    { day: 'Friday', sessions: 5, hours: 5 },
    { day: 'Saturday', sessions: 3, hours: 3 },
    { day: 'Sunday', sessions: 2, hours: 2 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground">
            Manage your training sessions and availability
          </p>
        </div>
        <PermissionGate permission="trainer.schedule.manage">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Session
          </Button>
        </PermissionGate>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today's Sessions
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaysSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center text-sm">
                    <span className="font-medium">{session.time.split(' ')[0]}</span>
                    <span className="text-xs text-muted-foreground">{session.time.split(' ')[1]}</span>
                  </div>
                  <div>
                    <p className="font-medium">{session.client}</p>
                    <p className="text-sm text-muted-foreground">{session.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{session.duration}</span>
                  <Badge variant={session.status === 'current' ? 'default' : 'outline'}>
                    {session.status}
                  </Badge>
                  <PermissionGate permission="trainer.schedule.manage">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </PermissionGate>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklySchedule.map((day) => (
              <div key={day.day} className="flex items-center justify-between">
                <span className="font-medium">{day.day}</span>
                <div className="text-right text-sm">
                  <p>{day.sessions} sessions</p>
                  <p className="text-muted-foreground">{day.hours}h</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

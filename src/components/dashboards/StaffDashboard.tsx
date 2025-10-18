
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  Clock,
  Star,
  CheckCircle,
  MessageSquare,
  Clipboard,
  Coffee,
  UserCheck,
  Phone,
  Mail,
  AlertCircle,
  TrendingUp,
  FileText,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const StaffDashboard = () => {
  const { authState } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Good morning, {authState.user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            {authState.user?.branchName} • Front Desk Staff Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <UserCheck className="w-3 h-3 mr-1" />
            Staff
          </Badge>
          <Badge variant="outline">
            {authState.user?.branchName}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">47</p>
                <p className="text-sm text-muted-foreground">Members Checked In</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">Support Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.9</p>
                <p className="text-sm text-muted-foreground">Service Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
          <TabsTrigger value="checkin">Member Check-in</TabsTrigger>
          <TabsTrigger value="support">Support Tickets</TabsTrigger>
          <TabsTrigger value="tasks">Daily Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Your tasks and appointments for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { time: '09:00 AM', task: 'Front desk coverage', type: 'shift', status: 'completed' },
                  { time: '10:00 AM', task: 'New member orientation - John Smith', type: 'appointment', status: 'completed' },
                  { time: '11:30 AM', task: 'Equipment maintenance check', type: 'task', status: 'current' },
                  { time: '01:00 PM', task: 'Lunch break', type: 'break', status: 'upcoming' },
                  { time: '02:00 PM', task: 'Member consultation - Sarah Davis', type: 'appointment', status: 'upcoming' },
                  { time: '03:30 PM', task: 'Daily report preparation', type: 'task', status: 'upcoming' },
                  { time: '05:00 PM', task: 'Closing duties', type: 'shift', status: 'upcoming' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium">{item.task}</p>
                        <p className="text-sm text-muted-foreground">{item.time} • {item.type}</p>
                      </div>
                    </div>
                    <Badge variant={
                      item.status === 'completed' ? 'default' :
                      item.status === 'current' ? 'destructive' : 'outline'
                    }>
                      {item.status === 'completed' ? <CheckCircle className="w-3 h-3 mr-1" /> : null}
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Check In Member
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Handle Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  New Member Setup
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Member
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checkin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Check-in</CardTitle>
              <CardDescription>Process member check-ins and manage access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">47</p>
                        <p className="text-sm text-muted-foreground">Today's Check-ins</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">23</p>
                        <p className="text-sm text-muted-foreground">Currently in Gym</p>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Recent Check-ins</h4>
                  {[
                    { member: 'John Smith', time: '2 minutes ago', status: 'checked-in' },
                    { member: 'Sarah Davis', time: '8 minutes ago', status: 'checked-in' },
                    { member: 'Mike Johnson', time: '15 minutes ago', status: 'checked-out' },
                    { member: 'Lisa Chen', time: '22 minutes ago', status: 'checked-in' },
                    { member: 'David Wilson', time: '28 minutes ago', status: 'checked-in' }
                  ].map((checkin, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{checkin.member}</p>
                        <p className="text-sm text-muted-foreground">{checkin.time}</p>
                      </div>
                      <Badge variant={checkin.status === 'checked-in' ? 'default' : 'outline'}>
                        {checkin.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Handle member inquiries and support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: '#1234', member: 'John Smith', issue: 'Membership renewal question', priority: 'medium', time: '10 minutes ago' },
                  { id: '#1235', member: 'Sarah Davis', issue: 'Equipment malfunction report', priority: 'high', time: '25 minutes ago' },
                  { id: '#1236', member: 'Mike Johnson', issue: 'Class scheduling inquiry', priority: 'low', time: '1 hour ago' },
                  { id: '#1237', member: 'Lisa Chen', issue: 'Billing discrepancy', priority: 'high', time: '2 hours ago' },
                  { id: '#1238', member: 'David Wilson', issue: 'Lost membership card', priority: 'medium', time: '3 hours ago' }
                ].map((ticket, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium">{ticket.member}</p>
                        <p className="text-sm text-muted-foreground">{ticket.id} • {ticket.issue}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        ticket.priority === 'high' ? 'destructive' :
                        ticket.priority === 'medium' ? 'default' : 'outline'
                      }>
                        {ticket.priority}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{ticket.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Tasks</CardTitle>
              <CardDescription>Complete your daily responsibilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { task: 'Equipment cleaning and inspection', category: 'maintenance', completed: true, time: '09:00 AM' },
                  { task: 'New member orientation packet preparation', category: 'admin', completed: true, time: '10:00 AM' },
                  { task: 'Inventory check - towels and supplies', category: 'maintenance', completed: false, time: '11:30 AM' },
                  { task: 'Update membership database', category: 'admin', completed: false, time: '02:00 PM' },
                  { task: 'Facility safety inspection', category: 'maintenance', completed: false, time: '03:30 PM' },
                  { task: 'Prepare daily attendance report', category: 'admin', completed: false, time: '04:00 PM' }
                ].map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${task.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.task}
                        </p>
                        <p className="text-sm text-muted-foreground">{task.time} • {task.category}</p>
                      </div>
                    </div>
                    <Button size="sm" variant={task.completed ? 'outline' : 'default'}>
                      {task.completed ? 'Completed' : 'Mark Done'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

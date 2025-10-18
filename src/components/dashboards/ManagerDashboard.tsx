
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Activity, 
  Clock,
  Star,
  UserCheck,
  BarChart3,
  Target,
  AlertCircle
} from 'lucide-react';

export const ManagerDashboard = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-foreground">Manager Dashboard</h1>
      <Badge>Management Access</Badge>
    </div>
    
    {/* Key Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/90">Team Performance</CardTitle>
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span className="text-2xl font-bold">94%</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-white/70">Above target this month</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/90">Branch Revenue</CardTitle>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-2xl font-bold">$85K</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-white/70">+18% from last month</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/90">Member Retention</CardTitle>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="text-2xl font-bold">87%</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-white/70">Industry leading</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Staff Utilization</CardTitle>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-success" />
            <span className="text-2xl font-bold text-foreground">82%</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Optimal efficiency</p>
        </CardContent>
      </Card>
    </div>

    {/* Management Tools */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>Oversee staff and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button className="h-20 flex flex-col gap-2">
              <UserCheck className="w-6 h-6" />
              <span className="text-sm">Staff Schedule</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="w-6 h-6" />
              <span className="text-sm">Member Data</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Class Planning</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Priority Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { task: 'Review monthly performance reports', priority: 'High', due: 'Today' },
            { task: 'Approve new staff schedules', priority: 'Medium', due: 'Tomorrow' },
            { task: 'Equipment maintenance review', priority: 'Low', due: 'This week' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{item.task}</p>
                <p className="text-sm text-muted-foreground">Due: {item.due}</p>
              </div>
              <Badge variant={item.priority === 'High' ? 'destructive' : item.priority === 'Medium' ? 'default' : 'secondary'}>
                {item.priority}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

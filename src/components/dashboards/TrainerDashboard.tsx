import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  Clock,
  Star,
  Trophy,
  Activity,
  Target,
  Dumbbell,
  TrendingUp,
  DollarSign,
  UserCheck,
  FileText,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export const TrainerDashboard = () => {
  const { authState } = useAuth();

  // Fetch trainer assignments (clients)
  const { data: assignments = [], isLoading: assignmentsLoading } = useSupabaseQuery(
    ['trainer-assignments', authState.user?.id],
    async () => {
      const { data, error } = await supabase
        .from('trainer_assignments')
        .select(`
          *,
          members (id, full_name, user_id)
        `)
        .eq('trainer_id', authState.user?.id)
        .in('status', ['scheduled', 'in_progress']);
      
      if (error) throw error;
      return data || [];
    },
    { enabled: !!authState.user?.id }
  );

  // Fetch today's classes
  const { data: todayClasses = [], isLoading: classesLoading } = useSupabaseQuery(
    ['trainer-today-classes', authState.user?.id],
    async () => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const { data, error } = await supabase
        .from('gym_classes')
        .select('*')
        .eq('trainer_id', authState.user?.id)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .eq('status', 'scheduled')
        .order('start_time');
      
      if (error) throw error;
      return data || [];
    },
    { enabled: !!authState.user?.id }
  );

  // Fetch monthly earnings
  const { data: earnings, isLoading: earningsLoading } = useSupabaseQuery(
    ['trainer-monthly-earnings', authState.user?.id],
    async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'income')
        .gte('date', startOfMonth(new Date()).toISOString().split('T')[0])
        .lte('date', endOfMonth(new Date()).toISOString().split('T')[0]);
      
      if (error) throw error;
      return data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    },
    { enabled: !!authState.user?.id }
  );

  // Fetch trainer profile for rating
  const { data: trainerProfile } = useSupabaseQuery(
    ['trainer-profile', authState.user?.id],
    async () => {
      const { data, error } = await supabase
        .from('trainer_profiles')
        .select('rating, total_clients')
        .eq('user_id', authState.user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    { enabled: !!authState.user?.id }
  );

  const activeClients = assignments.filter(a => a.status === 'in_progress').length;
  const todaySessions = todayClasses.length;
  const avgRating = trainerProfile?.rating || 4.8;
  const monthlyEarnings = earnings || 0;

  if (assignmentsLoading || classesLoading || earningsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {authState.user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            {authState.user?.branchName} • Personal Trainer Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <UserCheck className="w-3 h-3 mr-1" />
            Trainer
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
                <p className="text-2xl font-bold">{activeClients}</p>
                <p className="text-sm text-muted-foreground">Active Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todaySessions}</p>
                <p className="text-sm text-muted-foreground">Today's Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{monthlyEarnings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Monthly Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today's Schedule</TabsTrigger>
          <TabsTrigger value="clients">My Clients</TabsTrigger>
          <TabsTrigger value="workouts">Workout Plans</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Today's Training Sessions</CardTitle>
                <CardDescription>Your scheduled sessions for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayClasses.length > 0 ? (
                  todayClasses.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-primary" />
                        <div>
                          <p className="font-medium">{session.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(session.start_time), 'h:mm a')} - {format(new Date(session.end_time), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {session.enrolled_count}/{session.capacity}
                        </span>
                        <Badge variant={session.status === 'completed' ? 'default' : 'outline'}>
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No sessions scheduled for today
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule New Session
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Workout Plan
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2" />
                  Track Progress
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message Client
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Clients</CardTitle>
              <CardDescription>Manage your active client relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignments.length > 0 ? (
                  assignments.map((assignment) => {
                    const progress = assignment.total_sessions > 0 
                      ? Math.round((assignment.completed_sessions / assignment.total_sessions) * 100)
                      : 0;
                    
                    return (
                      <Card key={assignment.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{assignment.members?.full_name}</h4>
                            <Badge variant="outline">
                              {assignment.completed_sessions}/{assignment.total_sessions}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {assignment.assignment_type === 'personal_training' ? 'Personal Training' : 'General Client'}
                          </p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <div className="col-span-3 text-center py-8 text-muted-foreground">
                    No active clients at the moment
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workout Plans</CardTitle>
              <CardDescription>Create and manage custom workout plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Beginner Strength', clients: 8, exercises: 12, duration: '45 min' },
                  { name: 'Advanced HIIT', clients: 5, exercises: 15, duration: '30 min' },
                  { name: 'Functional Training', clients: 12, exercises: 10, duration: '60 min' },
                  { name: 'Cardio Blast', clients: 15, exercises: 8, duration: '40 min' },
                  { name: 'Core Strength', clients: 10, exercises: 14, duration: '35 min' },
                  { name: 'Flexibility & Mobility', clients: 7, exercises: 18, duration: '50 min' }
                ].map((plan, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{plan.name}</h4>
                        <Dumbbell className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{plan.clients} clients • {plan.exercises} exercises</p>
                        <p>Duration: {plan.duration}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Assign</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Progress Tracking</CardTitle>
              <CardDescription>Monitor your clients' fitness journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">92%</p>
                        <p className="text-sm text-muted-foreground">Goal Achievement</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <Target className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">156</p>
                        <p className="text-sm text-muted-foreground">Total Workouts</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-8 h-8 text-yellow-600" />
                      <div>
                        <p className="text-2xl font-bold">28</p>
                        <p className="text-sm text-muted-foreground">Milestones Reached</p>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Recent Progress Updates</h4>
                  {[
                    { client: 'Sarah Johnson', achievement: 'Completed 30-day strength program', date: '2 hours ago' },
                    { client: 'Mike Chen', achievement: 'Increased bench press by 15lbs', date: '1 day ago' },
                    { client: 'Lisa Rodriguez', achievement: 'Ran 5K in under 25 minutes', date: '2 days ago' },
                    { client: 'David Kim', achievement: 'Lost 5 pounds this month', date: '3 days ago' }
                  ].map((update, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{update.client}</p>
                        <p className="text-sm text-muted-foreground">{update.achievement}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{update.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Activity, TrendingUp, Target, Award, Calendar, Plus } from 'lucide-react';
import { PermissionGate } from '@/components/PermissionGate';

export default function TrainerProgressPage() {
  const clientProgress = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c2be?w=150',
      progress: 85,
      goals: [
        { type: 'Weight Loss', target: 15, current: 12, unit: 'lbs' },
        { type: 'Strength', target: 100, current: 85, unit: 'lbs bench press' }
      ],
      recentAchievements: ['Lost 10 lbs', 'Increased bench press by 20 lbs'],
      nextMilestone: 'Target weight goal'
    },
    {
      id: 2,
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      progress: 72,
      goals: [
        { type: 'Muscle Gain', target: 10, current: 7, unit: 'lbs' },
        { type: 'Endurance', target: 30, current: 22, unit: 'min cardio' }
      ],
      recentAchievements: ['Gained 5 lbs muscle', 'Improved cardio endurance'],
      nextMilestone: 'Muscle gain target'
    },
    {
      id: 3,
      name: 'Lisa Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      progress: 91,
      goals: [
        { type: 'Flexibility', target: 100, current: 90, unit: '% mobility score' },
        { type: 'Core Strength', target: 60, current: 55, unit: 'sec plank hold' }
      ],
      recentAchievements: ['Improved flexibility by 25%', 'Achieved 50s plank hold'],
      nextMilestone: 'Perfect mobility score'
    }
  ];

  const overallStats = {
    totalClients: 24,
    avgProgress: 82,
    goalsAchieved: 45,
    activePlans: 18
  };

  const recentMilestones = [
    { client: 'Sarah Johnson', achievement: 'Completed 30-day challenge', date: '2 hours ago', type: 'challenge' },
    { client: 'Mike Chen', achievement: 'Personal best: 185 lbs deadlift', date: '1 day ago', type: 'personal_record' },
    { client: 'Lisa Rodriguez', achievement: 'Perfect attendance this month', date: '2 days ago', type: 'attendance' },
    { client: 'David Kim', achievement: 'Lost 10 pounds milestone', date: '3 days ago', type: 'weight_loss' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Progress Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your clients' fitness journey and achievements
          </p>
        </div>
        <PermissionGate permission="trainer.progress.track">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Log Progress
          </Button>
        </PermissionGate>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallStats.totalClients}</p>
                <p className="text-sm text-muted-foreground">Active Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallStats.avgProgress}%</p>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Target className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallStats.goalsAchieved}</p>
                <p className="text-sm text-muted-foreground">Goals Achieved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallStats.activePlans}</p>
                <p className="text-sm text-muted-foreground">Active Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Client Progress</TabsTrigger>
          <TabsTrigger value="milestones">Recent Milestones</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <div className="space-y-4">
            {clientProgress.map((client) => (
              <Card key={client.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={client.avatar} alt={client.name} />
                      <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <CardDescription>Next milestone: {client.nextMilestone}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{client.progress}%</p>
                      <p className="text-sm text-muted-foreground">Overall Progress</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Current Goals</h4>
                    {client.goals.map((goal, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{goal.type}</span>
                          <span>{goal.current}/{goal.target} {goal.unit}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(goal.current / goal.target) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Achievements</h4>
                    <div className="flex flex-wrap gap-2">
                      {client.recentAchievements.map((achievement, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          {achievement}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <PermissionGate permission="trainer.progress.track">
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        Update Progress
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </PermissionGate>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Recent Milestones
              </CardTitle>
              <CardDescription>Latest achievements from your clients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentMilestones.map((milestone, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Award className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{milestone.client}</p>
                      <p className="text-sm text-muted-foreground">{milestone.achievement}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {milestone.type.replace('_', ' ')}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{milestone.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Analytics</CardTitle>
              <CardDescription>Detailed analytics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 space-y-3">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Advanced analytics coming soon</p>
                <p className="text-sm text-muted-foreground">
                  Track detailed progress trends, comparative analytics, and predictive insights
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

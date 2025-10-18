
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Plus, 
  Trophy, 
  Calendar,
  TrendingUp,
  Weight,
  Activity,
  Clock
} from 'lucide-react';

export default function Goals() {
  const goals = [
    {
      id: '1',
      title: 'Lose 10 kg',
      description: 'Target weight loss by end of March',
      category: 'Weight Loss',
      target: 10,
      current: 6.5,
      unit: 'kg',
      deadline: '2024-03-31',
      status: 'active',
      progress: 65
    },
    {
      id: '2',
      title: 'Run 5K in under 25 minutes',
      description: 'Improve cardiovascular endurance',
      category: 'Cardio',
      target: 25,
      current: 28.5,
      unit: 'minutes',
      deadline: '2024-02-28',
      status: 'active',
      progress: 45
    },
    {
      id: '3',
      title: 'Bench Press 80kg',
      description: 'Increase upper body strength',
      category: 'Strength',
      target: 80,
      current: 65,
      unit: 'kg',
      deadline: '2024-04-15',
      status: 'active',
      progress: 81
    },
    {
      id: '4',
      title: 'Attend 20 classes this month',
      description: 'Stay consistent with group fitness',
      category: 'Consistency',
      target: 20,
      current: 15,
      unit: 'classes',
      deadline: '2024-01-31',
      status: 'active',
      progress: 75
    }
  ];

  const achievements = [
    { title: 'First 5K Complete', date: '2024-01-10', category: 'Cardio' },
    { title: 'Lost 5kg', date: '2024-01-05', category: 'Weight Loss' },
    { title: '30-Day Streak', date: '2023-12-25', category: 'Consistency' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Goals & Progress</h1>
          <p className="text-muted-foreground">Track your fitness goals and celebrate achievements</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Set New Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Goals</CardTitle>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">{goals.length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Achievements</CardTitle>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-2xl font-bold text-foreground">{achievements.length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Goals completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Progress</CardTitle>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-2xl font-bold text-foreground">67%</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across all goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-secondary" />
              <span className="text-2xl font-bold text-foreground">15</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Workouts completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Goals</CardTitle>
              <CardDescription>Your current fitness objectives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{goal.title}</h3>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    <Badge variant="outline">{goal.category}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span>Progress: {goal.current} / {goal.target} {goal.unit}</span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  
                  <Progress value={goal.progress} className="h-2" />
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Recent Achievements
              </CardTitle>
              <CardDescription>Goals you've successfully completed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <div className="flex-1">
                    <p className="font-medium">{achievement.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {achievement.category} • {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {achievements.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No achievements yet</p>
                  <p className="text-xs">Complete your first goal to earn an achievement!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Goal Categories</CardTitle>
              <CardDescription>Focus areas for your fitness journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Weight Loss', count: 1, icon: Weight, color: 'text-red-500' },
                { name: 'Strength', count: 1, icon: Trophy, color: 'text-blue-500' },
                { name: 'Cardio', count: 1, icon: Activity, color: 'text-green-500' },
                { name: 'Consistency', count: 1, icon: Target, color: 'text-purple-500' }
              ].map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.name} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${category.color}`} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary">{category.count} goal{category.count !== 1 ? 's' : ''}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

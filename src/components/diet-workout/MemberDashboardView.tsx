
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Apple, 
  Dumbbell, 
  Target, 
  TrendingUp, 
  Calendar,
  Star,
  CheckCircle,
  Clock,
  Heart,
  Zap
} from 'lucide-react';
import { mockPlanAssignments, mockAIInsights } from '@/utils/mockData';

interface MemberDashboardViewProps {
  memberId: string;
}

export const MemberDashboardView = ({ memberId }: MemberDashboardViewProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const memberAssignment = mockPlanAssignments.find(a => a.memberId === memberId);
  const memberInsights = mockAIInsights.filter(i => i.memberId === memberId);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700">Current Progress</CardTitle>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-800">
                {memberAssignment?.progress || 0}%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={memberAssignment?.progress || 0} className="h-2" />
            <p className="text-xs text-green-600 mt-2">Great progress this week!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Calories Today</CardTitle>
            <div className="flex items-center gap-2">
              <Apple className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold">1,450</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Target: 2,000 cal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Workouts This Week</CardTitle>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold">4/5</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">1 more to go!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Streak</CardTitle>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold">7</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="diet">Diet Plan</TabsTrigger>
          <TabsTrigger value="workout">Workout Plan</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                AI Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {memberInsights.slice(0, 3).map((insight) => (
                <div 
                  key={insight.id} 
                  className={`p-4 rounded-lg border ${
                    insight.priority === 'high' ? 'border-red-200 bg-red-50' :
                    insight.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                    'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                      {insight.actionItems && (
                        <ul className="text-sm mt-2 space-y-1">
                          {insight.actionItems.slice(0, 2).map((item, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                      {insight.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Apple className="w-6 h-6 mb-2" />
                  <span className="text-sm">Log Meal</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Dumbbell className="w-6 h-6 mb-2" />
                  <span className="text-sm">Start Workout</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="w-6 h-6 mb-2" />
                  <span className="text-sm">View Progress</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Heart className="w-6 h-6 mb-2" />
                  <span className="text-sm">Favorites</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diet">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-green-500" />
                Current Diet Plan
              </CardTitle>
              <CardDescription>Your personalized nutrition plan</CardDescription>
            </CardHeader>
            <CardContent>
              {memberAssignment?.dietPlanId ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Balanced Nutrition Plan</h3>
                    <Badge>Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    A well-rounded diet plan for general fitness and health
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Target Calories:</span>
                      <p className="font-medium">2,000/day</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">30 days</p>
                    </div>
                  </div>
                  <Button className="w-full">View Full Plan</Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Apple className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No diet plan assigned yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workout">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-blue-500" />
                Current Workout Plan
              </CardTitle>
              <CardDescription>Your personalized fitness routine</CardDescription>
            </CardHeader>
            <CardContent>
              {memberAssignment?.workoutPlanId ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Beginner Full Body</h3>
                    <Badge>Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Perfect starter workout for new gym members
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">4 weeks</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Session Time:</span>
                      <p className="font-medium">45 min</p>
                    </div>
                  </div>
                  <Button className="w-full">View Full Plan</Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No workout plan assigned yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                Progress Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Progress tracking coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

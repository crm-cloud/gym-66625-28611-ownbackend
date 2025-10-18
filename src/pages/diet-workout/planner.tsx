
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Utensils, Brain, LayoutDashboard, Calendar, Plus, ListChecks } from 'lucide-react';
import { DietPlanGenerator } from '@/components/diet-workout/DietPlanGenerator';
import { WorkoutPlanGenerator } from '@/components/diet-workout/WorkoutPlanGenerator';
import { AssignmentList } from '@/components/assignments';

// Placeholder components
const MemberDashboardView = ({ memberId }: { memberId: string }) => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Your Fitness Dashboard</CardTitle>
        <CardDescription>Welcome back! Here's an overview of your fitness journey.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Your personalized dashboard content will appear here.</p>
      </CardContent>
    </Card>
  </div>
);

const DietPlanList = ({ canCreate }: { canCreate: boolean }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Diet Plans</h2>
      {canCreate && (
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Plan
        </Button>
      )}
    </div>
    <p>Your diet plans will be listed here.</p>
  </div>
);

const WorkoutPlanList = ({ canCreate }: { canCreate: boolean }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Workout Plans</h2>
      {canCreate && (
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Plan
        </Button>
      )}
    </div>
    <p>Your workout plans will be listed here.</p>
  </div>
);

// AI Insights Panel Component
const AIInsightsPanel = () => (
  <Card>
    <CardHeader>
      <CardTitle>AI-Powered Insights</CardTitle>
      <CardDescription>Get personalized recommendations based on your data</CardDescription>
    </CardHeader>
    <CardContent>
      <p>AI insights and recommendations will appear here.</p>
    </CardContent>
  </Card>
);

export const DietWorkoutPlannerPage = () => {
  const { authState } = useAuth();
  const [activeTab, setActiveTab] = useState('diet');

  if (!authState.user) return null;

  const isMember = authState.user.role === 'member';
  const canCreatePlans = ['admin', 'trainer'].includes(authState.user.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fitness Planner</h1>
          <p className="text-muted-foreground">
            {isMember 
              ? 'Track your fitness journey and follow personalized plans'
              : 'Create and manage diet and workout plans'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {authState.user.role.charAt(0).toUpperCase() + authState.user.role.slice(1)}
          </Badge>
          {!isMember && (
            <Button size="sm" variant="outline" onClick={() => {
              // Open AI settings modal or page
              window.open('/system/ai-settings', '_blank');
            }}>
              <Brain className="h-4 w-4 mr-2" />
              AI Settings
            </Button>
          )}
        </div>
      </div>

      {isMember ? (
        <MemberDashboardView memberId={authState.user.id} />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="diet" className="flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              Diet Planner
            </TabsTrigger>
            <TabsTrigger value="workout" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Workout Planner
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diet" className="mt-6">
            <DietPlanGenerator />
          </TabsContent>

          <TabsContent value="workout" className="mt-6">
            <WorkoutPlanGenerator />
          </TabsContent>

          <TabsContent value="assignments" className="mt-6">
            <AssignmentList />
          </TabsContent>

          <TabsContent value="ai-insights" className="mt-6">
            <AIInsightsPanel />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

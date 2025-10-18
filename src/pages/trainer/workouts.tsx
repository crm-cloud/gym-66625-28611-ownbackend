
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dumbbell, Plus, Search, Users, Clock, Target, Edit, Copy, Trash2 } from 'lucide-react';
import { PermissionGate } from '@/components/PermissionGate';

export default function TrainerWorkoutsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const workoutPlans = [
    {
      id: 1,
      name: 'Beginner Strength Foundation',
      description: 'Perfect for clients starting their strength training journey',
      clients: 8,
      exercises: 12,
      duration: 45,
      difficulty: 'Beginner',
      category: 'Strength',
      lastUpdated: '2024-01-15',
      isTemplate: true
    },
    {
      id: 2,
      name: 'Advanced HIIT Circuit',
      description: 'High-intensity interval training for experienced athletes',
      clients: 5,
      exercises: 15,
      duration: 30,
      difficulty: 'Advanced',
      category: 'Cardio',
      lastUpdated: '2024-01-12',
      isTemplate: true
    },
    {
      id: 3,
      name: 'Functional Movement Pattern',
      description: 'Focus on everyday movement patterns and mobility',
      clients: 12,
      exercises: 10,
      duration: 60,
      difficulty: 'Intermediate',
      category: 'Functional',
      lastUpdated: '2024-01-10',
      isTemplate: true
    },
    {
      id: 4,
      name: 'Sarah\'s Custom Plan',
      description: 'Personalized workout for weight loss goals',
      clients: 1,
      exercises: 14,
      duration: 50,
      difficulty: 'Intermediate',
      category: 'Weight Loss',
      lastUpdated: '2024-01-14',
      isTemplate: false
    }
  ];

  const exerciseLibrary = [
    { name: 'Squats', category: 'Lower Body', equipment: 'Bodyweight' },
    { name: 'Push-ups', category: 'Upper Body', equipment: 'Bodyweight' },
    { name: 'Deadlifts', category: 'Full Body', equipment: 'Barbell' },
    { name: 'Plank', category: 'Core', equipment: 'Bodyweight' },
    { name: 'Lunges', category: 'Lower Body', equipment: 'Bodyweight' },
    { name: 'Pull-ups', category: 'Upper Body', equipment: 'Pull-up Bar' }
  ];

  const filteredPlans = workoutPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workout Plans</h1>
          <p className="text-muted-foreground">
            Create and manage custom workout plans for your clients
          </p>
        </div>
        <PermissionGate permission="trainer.workouts.create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New Plan
          </Button>
        </PermissionGate>
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">My Plans</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workout plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {workoutPlans.length} Total Plans
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription className="mt-1">{plan.description}</CardDescription>
                    </div>
                    <Badge variant={plan.isTemplate ? 'default' : 'secondary'}>
                      {plan.isTemplate ? 'Template' : 'Custom'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{plan.clients} clients</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Dumbbell className="w-3 h-3" />
                      <span>{plan.exercises} exercises</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{plan.duration}min</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(plan.difficulty)}>
                      {plan.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {plan.category}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(plan.lastUpdated).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <PermissionGate permission="trainer.workouts.create">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </PermissionGate>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workout Templates</CardTitle>
              <CardDescription>Pre-built workout templates you can customize for your clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workoutPlans.filter(plan => plan.isTemplate).map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg space-y-3">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{template.exercises} exercises</span>
                      <span>{template.duration}min</span>
                      <Badge className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                      </Badge>
                    </div>
                    <PermissionGate permission="trainer.workouts.create">
                      <Button size="sm" className="w-full">
                        <Copy className="w-3 h-3 mr-1" />
                        Use Template
                      </Button>
                    </PermissionGate>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Exercise Library
              </CardTitle>
              <CardDescription>Browse and add exercises to your workout plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {exerciseLibrary.map((exercise, index) => (
                  <div key={index} className="p-3 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-sm text-muted-foreground">{exercise.category}</p>
                      <p className="text-xs text-muted-foreground">{exercise.equipment}</p>
                    </div>
                    <PermissionGate permission="trainer.workouts.create">
                      <Button size="sm" variant="outline">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </PermissionGate>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

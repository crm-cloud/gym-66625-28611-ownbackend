
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Dumbbell, Clock, Users, Star, Timer, Loader2 } from 'lucide-react';
import { useWorkoutPlans } from '@/hooks/useWorkoutPlans';

interface WorkoutPlanListProps {
  canCreate: boolean;
}

export const WorkoutPlanList = ({ canCreate }: WorkoutPlanListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const { data: workoutPlans = [], isLoading } = useWorkoutPlans({
    difficulty: filterDifficulty,
    type: filterType
  });

  const filteredPlans = workoutPlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (plan.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return 'bg-blue-100 text-blue-800';
      case 'cardio': return 'bg-red-100 text-red-800';
      case 'hiit': return 'bg-orange-100 text-orange-800';
      case 'yoga': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Workout Plans</h2>
        {canCreate && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Workout Plan
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search workout plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Workout Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="hiit">HIIT</SelectItem>
                <SelectItem value="yoga">Yoga</SelectItem>
                <SelectItem value="pilates">Pilates</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Plans Grid */}
      {!isLoading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">4.7</span>
                </div>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={getDifficultyColor(plan.difficulty)}>
                  {plan.difficulty}
                </Badge>
                <Badge className={getWorkoutTypeColor(plan.workout_type)}>
                  {plan.workout_type}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{plan.duration_weeks} weeks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Session Time:</span>
                  <div className="flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    <span className="font-medium">{plan.estimated_duration} min</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Target:</span>
                  <span className="font-medium">{plan.target_muscle_groups?.slice(0, 2).join(', ') || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Created by:</span>
                  <span className="font-medium">{plan.created_by_name || 'System'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Created {new Date(plan.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" className="flex-1">
                  <Users className="w-4 h-4 mr-1" />
                  Assign
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>}

      {!isLoading && filteredPlans.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No workout plans found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterDifficulty !== 'all' || filterType !== 'all'
                ? 'Try adjusting your search criteria'
                : 'Create your first workout plan to get started'
              }
            </p>
            {canCreate && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Workout Plan
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

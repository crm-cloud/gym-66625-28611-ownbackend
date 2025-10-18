import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Dumbbell, Play, Clock, PlusCircle, PlayCircle, ListChecks } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  weightUnit: 'kg' | 'lb';
  restTime: number; // in seconds
  isWarmup: boolean;
  notes: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  restBetweenSets: number; // in seconds
  notes: string;
  videoUrl?: string;
  imageUrl?: string;
  muscleGroups: string[];
  equipment: string[];
}

interface WorkoutDay {
  day: number;
  name: string;
  focus: string;
  exercises: Exercise[];
  duration: number; // in minutes
  notes: string;
}

export function WorkoutPlanGenerator() {
  const [planName, setPlanName] = useState('');
  const [duration, setDuration] = useState(4);
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [workoutSplit, setWorkoutSplit] = useState('fullbody');
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [activeDay, setActiveDay] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('workout');

  // Initialize empty workout plan
  const initializePlan = () => {
    const workoutSplits = {
      fullbody: ['Full Body'],
      upperLower: ['Upper Body', 'Lower Body'],
      pushPullLegs: ['Push', 'Pull', 'Legs'],
      broSplit: ['Chest & Triceps', 'Back & Biceps', 'Legs', 'Shoulders & Abs']
    };

    const split = workoutSplits[workoutSplit as keyof typeof workoutSplits] || ['Workout'];
    const newDays: WorkoutDay[] = [];

    for (let i = 0; i < duration; i++) {
      const dayInSplit = i % split.length;
      newDays.push({
        day: i + 1,
        name: `${split[dayInSplit]} Day ${Math.floor(i / split.length) + 1}`,
        focus: split[dayInSplit],
        exercises: [],
        duration: 60,
        notes: ''
      });
    }

    setDays(newDays);
    setActiveDay(1);
  };

  const addExercise = (dayIndex: number) => {
    const newExercise: Exercise = {
      id: `exercise-${Date.now()}`,
      name: 'New Exercise',
      sets: [{
        id: `set-${Date.now()}`,
        reps: 10,
        weight: 20,
        weightUnit: 'kg',
        restTime: 60,
        isWarmup: false,
        notes: ''
      }],
      restBetweenSets: 90,
      notes: '',
      muscleGroups: [],
      equipment: []
    };

    const updatedDays = [...days];
    updatedDays[dayIndex].exercises.push(newExercise);
    setDays(updatedDays);
  };

  const addSet = (dayIndex: number, exerciseIndex: number) => {
    const updatedDays = [...days];
    const exercise = updatedDays[dayIndex].exercises[exerciseIndex];
    const lastSet = exercise.sets[exercise.sets.length - 1];
    
    exercise.sets.push({
      id: `set-${Date.now()}`,
      reps: lastSet ? lastSet.reps : 10,
      weight: lastSet ? lastSet.weight : 20,
      weightUnit: lastSet ? lastSet.weightUnit : 'kg',
      restTime: lastSet ? lastSet.restTime : 60,
      isWarmup: false,
      notes: ''
    });
    
    setDays(updatedDays);
  };

  const removeSet = (dayIndex: number, exerciseIndex: number, setId: string) => {
    if (days[dayIndex].exercises[exerciseIndex].sets.length <= 1) return;
    
    const updatedDays = [...days];
    updatedDays[dayIndex].exercises[exerciseIndex].sets = 
      updatedDays[dayIndex].exercises[exerciseIndex].sets.filter(set => set.id !== setId);
    
    setDays(updatedDays);
  };

  const updateSet = (dayIndex: number, exerciseIndex: number, setId: string, field: string, value: any) => {
    const updatedDays = [...days];
    const setIndex = updatedDays[dayIndex].exercises[exerciseIndex].sets.findIndex(s => s.id === setId);
    
    if (setIndex !== -1) {
      (updatedDays[dayIndex].exercises[exerciseIndex].sets[setIndex] as any)[field] = value;
      setDays(updatedDays);
    }
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would call your AI service
    const generatedPlan = {
      name: planName || 'AI-Generated Workout Plan',
      days: Array.from({ length: duration }, (_, dayIndex) => ({
        day: dayIndex + 1,
        name: `${['Full Body', 'Upper Body', 'Lower Body', 'Push', 'Pull', 'Legs', 'Chest & Triceps', 'Back & Biceps', 'Shoulders & Abs'][dayIndex % 9]} Day ${Math.floor(dayIndex / 3) + 1}`,
        focus: ['Strength', 'Hypertrophy', 'Endurance'][dayIndex % 3],
        exercises: Array.from({ length: 4 + (dayIndex % 3) }, (_, exIndex) => ({
          id: `exercise-${dayIndex}-${exIndex}`,
          name: [
            'Barbell Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Pull-Up',
            'Dumbbell Row', 'Lunges', 'Romanian Deadlift', 'Lat Pulldown', 'Shoulder Press'
          ][(dayIndex + exIndex) % 10],
          sets: Array.from({ length: 3 + (exIndex % 3) }, (_, setIndex) => ({
            id: `set-${dayIndex}-${exIndex}-${setIndex}`,
            reps: 8 + (setIndex * 2),
            weight: 20 + (exIndex * 5) + (setIndex * 2.5),
            weightUnit: 'kg' as const,
            restTime: 60 + (setIndex * 15),
            isWarmup: setIndex === 0,
            notes: setIndex === 0 ? 'Warm-up set' : ''
          })),
          restBetweenSets: 90,
          notes: '',
          muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
          equipment: ['Barbell', 'Dumbbells']
        })),
        duration: 60,
        notes: ''
      }))
    };
    
    setDays(generatedPlan.days);
    setIsGenerating(false);
  };

  const savePlan = () => {
    // Implement save functionality
    console.log('Saving workout plan:', { planName, days });
  };

  const currentDay = days[activeDay - 1];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Workout Plan Generator</h2>
          <p className="text-muted-foreground">Create and customize workout plans for your clients</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={initializePlan}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Plan
          </Button>
          <Button onClick={generateWithAI} disabled={isGenerating}>
            <Dumbbell className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </Button>
        </div>
      </div>

      {days.length === 0 ? (
        <Card className="text-center p-8">
          <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Workout Plan Created</h3>
          <p className="text-muted-foreground mb-4">
            Create a new workout plan or generate one with AI to get started.
          </p>
          <Button onClick={initializePlan}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Plan
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Plan Name</CardTitle>
                <Input 
                  value={planName} 
                  onChange={(e) => setPlanName(e.target.value)} 
                  placeholder="e.g., Strength Training Plan" 
                  className="text-lg font-semibold"
                />
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
                <Select 
                  value={duration.toString()} 
                  onValueChange={(value) => setDuration(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 weeks</SelectItem>
                    <SelectItem value="8">8 weeks</SelectItem>
                    <SelectItem value="12">12 weeks</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Workout Split</CardTitle>
                <Select 
                  value={workoutSplit} 
                  onValueChange={setWorkoutSplit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select split" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fullbody">Full Body</SelectItem>
                    <SelectItem value="upperLower">Upper/Lower</SelectItem>
                    <SelectItem value="pushPullLegs">Push/Pull/Legs</SelectItem>
                    <SelectItem value="broSplit">Bro Split</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Experience Level</CardTitle>
                <Select 
                  value={experienceLevel} 
                  onValueChange={setExperienceLevel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
            </Card>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2">
            {days.map((day) => (
              <Button
                key={day.day}
                variant={activeDay === day.day ? 'default' : 'outline'}
                onClick={() => setActiveDay(day.day)}
                className="min-w-[100px]"
              >
                Day {day.day}
              </Button>
            ))}
          </div>

          {currentDay && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">{currentDay.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">{currentDay.focus}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {currentDay.duration} min
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <ListChecks className="h-3 w-3 mr-1" />
                        {currentDay.exercises.length} exercises
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => addExercise(activeDay - 1)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exercise
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="workout">Workout</TabsTrigger>
                    <TabsTrigger value="notes">Day Notes</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="workout" className="space-y-6">
                    {currentDay.exercises.map((exercise, exerciseIndex) => (
                      <Card key={exercise.id} className="overflow-hidden">
                        <div className="bg-muted/30 p-4 border-b">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{exercise.name}</h3>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {exercise.muscleGroups.map((group) => (
                                  <Badge key={group} variant="secondary">{group}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Play className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="grid grid-cols-12 gap-2 font-medium text-sm text-muted-foreground mb-2">
                            <div className="col-span-1">Set</div>
                            <div className="col-span-2">Weight</div>
                            <div className="col-span-2">Reps</div>
                            <div className="col-span-2">Rest</div>
                            <div className="col-span-4">Notes</div>
                            <div className="col-span-1"></div>
                          </div>
                          
                          <div className="space-y-2">
                            {exercise.sets.map((set, setIndex) => (
                              <div key={set.id} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-1 font-medium">
                                  {set.isWarmup ? 'W' : setIndex + 1}
                                </div>
                                <div className="col-span-2">
                                  <div className="flex">
                                    <Input 
                                      type="number" 
                                      value={set.weight} 
                                      onChange={(e) => updateSet(
                                        activeDay - 1, 
                                        exerciseIndex, 
                                        set.id, 
                                        'weight', 
                                        parseFloat(e.target.value) || 0
                                      )}
                                      className="h-8"
                                    />
                                    <Select 
                                      value={set.weightUnit}
                                      onValueChange={(value) => updateSet(
                                        activeDay - 1, 
                                        exerciseIndex, 
                                        set.id, 
                                        'weightUnit', 
                                        value as 'kg' | 'lb'
                                      )}
                                    >
                                      <SelectTrigger className="w-16 h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="kg">kg</SelectItem>
                                        <SelectItem value="lb">lb</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <Input 
                                    type="number" 
                                    value={set.reps} 
                                    onChange={(e) => updateSet(
                                      activeDay - 1, 
                                      exerciseIndex, 
                                      set.id, 
                                      'reps', 
                                      parseInt(e.target.value) || 0
                                    )}
                                    className="h-8"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <div className="flex items-center">
                                    <Input 
                                      type="number" 
                                      value={set.restTime} 
                                      onChange={(e) => updateSet(
                                        activeDay - 1, 
                                        exerciseIndex, 
                                        set.id, 
                                        'restTime', 
                                        parseInt(e.target.value) || 0
                                      )}
                                      className="h-8"
                                    />
                                    <span className="ml-1 text-sm">s</span>
                                  </div>
                                </div>
                                <div className="col-span-4">
                                  <Input 
                                    value={set.notes} 
                                    onChange={(e) => updateSet(
                                      activeDay - 1, 
                                      exerciseIndex, 
                                      set.id, 
                                      'notes', 
                                      e.target.value
                                    )}
                                    placeholder="Notes"
                                    className="h-8"
                                  />
                                </div>
                                <div className="col-span-1 flex justify-end">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => removeSet(activeDay - 1, exerciseIndex, set.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-3 flex justify-between">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => addSet(activeDay - 1, exerciseIndex)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Set
                            </Button>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              Rest: {exercise.restBetweenSets}s between sets
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <Label htmlFor={`exercise-notes-${exercise.id}`} className="text-sm">Exercise Notes</Label>
                            <Textarea 
                              id={`exercise-notes-${exercise.id}`}
                              value={exercise.notes}
                              onChange={(e) => {
                                const updatedDays = [...days];
                                updatedDays[activeDay - 1].exercises[exerciseIndex].notes = e.target.value;
                                setDays(updatedDays);
                              }}
                              placeholder="Add exercise notes or instructions..."
                              className="mt-1 text-sm min-h-[60px]"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="notes">
                    <Textarea 
                      value={currentDay.notes}
                      onChange={(e) => {
                        const updatedDays = [...days];
                        updatedDays[activeDay - 1].notes = e.target.value;
                        setDays(updatedDays);
                      }}
                      placeholder="Add notes for this workout day..."
                      className="min-h-[200px]"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-4 pt-6">
            <Button variant="outline">Cancel</Button>
            <Button onClick={savePlan}>
              Save Workout Plan
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

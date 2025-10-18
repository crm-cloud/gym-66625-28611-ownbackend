import { useState, useEffect } from 'react';
import { useAIPlanGenerator } from '@/hooks/useAIPlanGenerator';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Brain, Clock, Utensils, PlusCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  id: string;
  name: string;
  time: string;
  foods: FoodItem[];
  notes?: string; // Made optional to match usage in the component
}

interface DayPlan {
  day: number;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export function DietPlanGenerator() {
  const [planName, setPlanName] = useState('');
  const [duration, setDuration] = useState(7);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [targetCalories, setTargetCalories] = useState(2000);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [days, setDays] = useState<DayPlan[]>([]);
  const [activeDay, setActiveDay] = useState(1);
  const { generatePlan, isGenerating } = useAIPlanGenerator();
  const { toast } = useToast();
  
  // Define types for AI response
  interface AIFoodItem {
    id?: string;
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }
  
  interface AIMeal {
    id?: string;
    name: string;
    time: string;
    foods: AIFoodItem[];
    notes?: string;
  }
  
  interface AIDayPlan {
    day: number;
    meals: AIMeal[];
    totalCalories?: number;
    totalProtein?: number;
    totalCarbs?: number;
    totalFat?: number;
  }

  // Initialize empty plan structure
  const initializePlan = () => {
    const newDays: DayPlan[] = [];
    const mealNames = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-Workout', 'Post-Workout'];
    
    for (let i = 1; i <= duration; i++) {
      const meals: Meal[] = [];
      for (let j = 0; j < mealsPerDay; j++) {
        meals.push({
          id: `day${i}-meal${j+1}`,
          name: mealNames[j] || `Meal ${j+1}`,
          time: j === 0 ? '08:00' : j === 1 ? '12:00' : j === 2 ? '19:00' : '15:00',
          foods: [],
          notes: ''
        });
      }
      newDays.push({
        day: i,
        meals,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0
      });
    }
    setDays(newDays);
    setActiveDay(1);
  };

  const addFoodToMeal = (dayIndex: number, mealIndex: number) => {
    const newFood: FoodItem = {
      id: `food-${Date.now()}`,
      name: 'New Food',
      quantity: 100,
      unit: 'g',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    const updatedDays = [...days];
    updatedDays[dayIndex].meals[mealIndex].foods.push(newFood);
    setDays(updatedDays);
  };

  const updateFoodItem = (dayIndex: number, mealIndex: number, foodIndex: number, field: keyof FoodItem, value: any) => {
    const updatedDays = [...days];
    const foodItem = updatedDays[dayIndex].meals[mealIndex].foods[foodIndex];
    (foodItem as any)[field] = value;
    
    // Recalculate totals
    const day = updatedDays[dayIndex];
    day.totalCalories = day.meals.reduce((sum, meal) => 
      sum + meal.foods.reduce((mealSum, food) => mealSum + (food.calories || 0), 0), 0);
    
    day.totalProtein = day.meals.reduce((sum, meal) => 
      sum + meal.foods.reduce((mealSum, food) => mealSum + (food.protein || 0), 0), 0);
    
    setDays(updatedDays);
  };

  const removeFoodFromMeal = (dayIndex: number, mealIndex: number, foodId: string) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].meals[mealIndex].foods = 
      updatedDays[dayIndex].meals[mealIndex].foods.filter(food => food.id !== foodId);
    setDays(updatedDays);
  };

  const generateWithAI = async () => {
    try {
      const preferences = {
        dietaryRestrictions,
        targetCalories,
        mealsPerDay,
        // Add more preferences as needed
      };

      const result = await generatePlan({
        planType: 'diet',
        duration,
        preferences,
      });

      // Update the plan with AI-generated data
      if (result) {
        setDays((prevDays: DayPlan[]) => {
          // Merge AI-generated days with existing days
          const newDays = [...prevDays];
          (result.days as AIDayPlan[]).forEach((day: AIDayPlan) => {
            const dayIndex = day.day - 1;
            if (dayIndex < newDays.length) {
              newDays[dayIndex] = {
                ...newDays[dayIndex],
                ...day,
                meals: day.meals.map((meal: AIMeal) => ({
                  id: meal.id || `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: meal.name,
                  time: meal.time,
                  notes: meal.notes || '', // Ensure notes is always a string
                  foods: meal.foods.map((food: AIFoodItem) => ({
                    id: food.id || `food-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: food.name,
                    quantity: food.quantity,
                    unit: food.unit,
                    calories: food.calories,
                    protein: food.protein,
                    carbs: food.carbs,
                    fat: food.fat,
                  })),
                })),
              };
            }
          });
          return newDays;
        });
      }
    } catch (error) {
      console.error('Error generating plan with AI:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate plan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const savePlan = async () => {
    try {
      // In a real app, you would save the plan to your database
      // await api.saveDietPlan({
      //   name: planName,
      //   days,
      //   duration,
      //   targetCalories,
      //   dietaryRestrictions,
      // });
      
      toast({
        title: 'Success',
        description: 'Diet plan saved successfully',
      });
      
      console.log('Saving plan:', { planName, days });
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save diet plan',
        variant: 'destructive',
      });
    }
  };

  const currentDay = days[activeDay - 1];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Diet Plan Generator</h2>
          <p className="text-muted-foreground">Create and customize diet plans for your clients</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={initializePlan}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Plan
          </Button>
          <Button onClick={generateWithAI} disabled={isGenerating}>
            <Brain className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </Button>
        </div>
      </div>

      {days.length === 0 ? (
        <Card className="text-center p-8">
          <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Diet Plan Created</h3>
          <p className="text-muted-foreground mb-4">
            Create a new diet plan or generate one with AI to get started.
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
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <div className="flex space-x-2">
                    <Input 
                      value={planName} 
                      onChange={(e) => setPlanName(e.target.value)} 
                      placeholder="e.g., Weight Loss Plan" 
                      className="text-lg font-semibold flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setPlanName('');
                        setDays([]);
                      }}
                      disabled={!planName && days.length === 0}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
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
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="21">21 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Daily Calories</CardTitle>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Duration (days)</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={initializePlan}
                      disabled={isGenerating}
                    >
                      {days.length === 0 ? 'Initialize Plan' : 'Reset Plan'}
                    </Button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">{targetCalories}</span>
                    <span className="text-sm text-muted-foreground">kcal</span>
                  </div>
                  <Slider
                    value={[targetCalories]}
                    min={1200}
                    max={4000}
                    step={50}
                    onValueChange={(value) => setTargetCalories(value[0])}
                  />
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Macros</CardTitle>
                {currentDay && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Protein</span>
                      <span className="font-medium">{currentDay.totalProtein}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Carbs</span>
                      <span className="font-medium">{currentDay.totalCarbs}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Fat</span>
                      <span className="font-medium">{currentDay.totalFat}g</span>
                    </div>
                  </div>
                )}
              </CardHeader>
            </Card>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2">
            {days.map((day) => (
              <Button
                key={day.day}
                variant={activeDay === day.day ? 'default' : 'outline'}
                onClick={() => setActiveDay(day.day)}
                className="min-w-[60px]"
              >
                Day {day.day}
              </Button>
            ))}
          </div>

          {currentDay && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Day {currentDay.day} Meals</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {currentDay.totalCalories} kcal
                  </span>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {currentDay.meals.length} Meals
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentDay.meals.map((meal, mealIndex) => (
                  <Card key={meal.id} className="h-full">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{meal.name}</CardTitle>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {meal.time}
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {meal.foods.reduce((sum, food) => sum + (food.calories || 0), 0)} kcal
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {meal.foods.map((food, foodIndex) => (
                          <div key={food.id} className="border rounded p-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{food.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {food.quantity}{food.unit} • {food.calories} kcal
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => removeFoodFromMeal(activeDay - 1, mealIndex, food.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                              <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-center">
                                P: {food.protein}g
                              </div>
                              <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-center">
                                C: {food.carbs}g
                              </div>
                              <div className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-center">
                                F: {food.fat}g
                              </div>
                            </div>
                          </div>
                        ))}

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => addFoodToMeal(activeDay - 1, mealIndex)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Food
                        </Button>

                        <div className="mt-3">
                          <Label htmlFor={`meal-notes-${meal.id}`} className="text-sm">Notes</Label>
                          <Textarea 
                            id={`meal-notes-${meal.id}`}
                            value={meal.notes}
                            onChange={(e) => {
                              const updatedDays = [...days];
                              updatedDays[activeDay - 1].meals[mealIndex].notes = e.target.value;
                              setDays(updatedDays);
                            }}
                            placeholder="Add preparation notes or instructions..."
                            className="min-h-[80px] text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t">
            <div>
              {days.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {days.flatMap(day => day.meals).length} meals planned • {days.length} days • {targetCalories} kcal/day
                </p>
              )}
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => window.history.back()}>
                Back
              </Button>
              <Button 
                onClick={savePlan} 
                disabled={days.length === 0 || isGenerating}
                className="min-w-[100px]"
              >
                {isGenerating ? 'Saving...' : 'Save Plan'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

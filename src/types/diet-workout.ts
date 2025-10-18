
export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  nutrition: NutritionInfo;
  preparationTime: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  imageUrl?: string;
  instructions: string[];
}

export interface DietPlan {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdByName: string;
  targetCalories: number;
  duration: number; // in days
  meals: Record<string, Meal[]>; // day -> meals
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  dietType: 'balanced' | 'keto' | 'vegan' | 'paleo' | 'mediterranean' | 'low-carb';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  imageUrl?: string;
  videoUrl?: string;
  tips: string[];
}

export interface WorkoutSet {
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number; // for cardio exercises
  restTime: number; // in seconds
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdByName: string;
  duration: number; // in weeks
  workouts: Record<string, WorkoutSet[]>; // day -> workout sets
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  workoutType: 'strength' | 'cardio' | 'hiit' | 'yoga' | 'pilates' | 'mixed';
  targetMuscleGroups: string[];
  estimatedDuration: number; // minutes per workout
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberPlanAssignment {
  id: string;
  memberId: string;
  memberName: string;
  dietPlanId?: string;
  workoutPlanId?: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  status: 'active' | 'completed' | 'paused';
  assignedBy: string;
  assignedByName: string;
  notes?: string;
  customizations?: {
    calorieAdjustment?: number;
    excludedExercises?: string[];
    modifiedMeals?: Record<string, Meal>;
  };
}

export interface PlanProgress {
  id: string;
  memberId: string;
  planId: string;
  planType: 'diet' | 'workout';
  date: Date;
  completedMeals?: string[];
  completedWorkouts?: string[];
  weight?: number;
  bodyFat?: number;
  measurements?: Record<string, number>;
  notes?: string;
  rating?: number; // 1-5
}

export interface AIInsight {
  id: string;
  memberId: string;
  type: 'nutrition' | 'workout' | 'progress' | 'recommendation';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionItems?: string[];
  generatedAt: Date;
  isRead: boolean;
}

export interface FavoritePlan {
  id: string;
  memberId: string;
  planId: string;
  planType: 'diet' | 'workout';
  savedAt: Date;
}

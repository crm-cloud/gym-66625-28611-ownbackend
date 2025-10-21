import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dietWorkoutService = {
  async getDietPlans(filters: any) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.member_id) where.member_id = filters.member_id;
    if (filters.trainer_id) where.trainer_id = filters.trainer_id;
    if (filters.is_active !== undefined) where.is_active = filters.is_active;

    const [plans, total] = await Promise.all([
      prisma.diet_plans.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { members: true, trainers: true }
      }),
      prisma.diet_plans.count({ where })
    ]);

    return { plans, total, page, limit };
  },

  async getDietPlanById(id: string) {
    return await prisma.diet_plans.findUnique({
      where: { id },
      include: { members: true, trainers: true }
    });
  },

  async createDietPlan(data: any) {
    return await prisma.diet_plans.create({ data });
  },

  async updateDietPlan(id: string, data: any) {
    return await prisma.diet_plans.update({ where: { id }, data });
  },

  async deleteDietPlan(id: string) {
    return await prisma.diet_plans.delete({ where: { id } });
  },

  async getWorkoutPlans(filters: any) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.member_id) where.member_id = filters.member_id;
    if (filters.trainer_id) where.trainer_id = filters.trainer_id;
    if (filters.is_active !== undefined) where.is_active = filters.is_active;

    const [plans, total] = await Promise.all([
      prisma.workout_plans.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { members: true, trainers: true }
      }),
      prisma.workout_plans.count({ where })
    ]);

    return { plans, total, page, limit };
  },

  async getWorkoutPlanById(id: string) {
    return await prisma.workout_plans.findUnique({
      where: { id },
      include: { members: true, trainers: true }
    });
  },

  async createWorkoutPlan(data: any) {
    return await prisma.workout_plans.create({ data });
  },

  async updateWorkoutPlan(id: string, data: any) {
    return await prisma.workout_plans.update({ where: { id }, data });
  },

  async deleteWorkoutPlan(id: string) {
    return await prisma.workout_plans.delete({ where: { id } });
  },

  // Meals Management
  async getMeals(dietPlanId: string) {
    return await prisma.meals.findMany({
      where: { diet_plan_id: dietPlanId },
      orderBy: { meal_time: 'asc' }
    });
  },

  async createMeal(data: any) {
    return await prisma.meals.create({ 
      data: {
        diet_plan_id: data.diet_plan_id,
        meal_time: data.meal_time,
        meal_name: data.meal_name,
        food_items: data.food_items,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fats: data.fats,
        instructions: data.instructions
      }
    });
  },

  async updateMeal(id: string, data: any) {
    return await prisma.meals.update({ where: { id }, data });
  },

  async deleteMeal(id: string) {
    return await prisma.meals.delete({ where: { id } });
  },

  // Exercises Management
  async getExercises(workoutPlanId: string) {
    return await prisma.exercises.findMany({
      where: { workout_plan_id: workoutPlanId },
      include: {
        workout_sets: {
          orderBy: { set_number: 'asc' }
        }
      },
      orderBy: { order_index: 'asc' }
    });
  },

  async createExercise(data: any) {
    return await prisma.exercises.create({ 
      data: {
        workout_plan_id: data.workout_plan_id,
        exercise_name: data.exercise_name,
        description: data.description,
        muscle_group: data.muscle_group,
        equipment: data.equipment,
        order_index: data.order_index || 0
      }
    });
  },

  async updateExercise(id: string, data: any) {
    return await prisma.exercises.update({ where: { id }, data });
  },

  async deleteExercise(id: string) {
    return await prisma.exercises.delete({ where: { id } });
  },

  // Workout Sets Management
  async createWorkoutSet(data: any) {
    return await prisma.workout_sets.create({
      data: {
        exercise_id: data.exercise_id,
        set_number: data.set_number,
        reps: data.reps,
        weight: data.weight,
        duration_seconds: data.duration_seconds,
        rest_seconds: data.rest_seconds,
        notes: data.notes
      }
    });
  },

  async updateWorkoutSet(id: string, data: any) {
    return await prisma.workout_sets.update({ where: { id }, data });
  },

  async deleteWorkoutSet(id: string) {
    return await prisma.workout_sets.delete({ where: { id } });
  }
};

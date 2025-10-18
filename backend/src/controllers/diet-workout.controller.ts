import { Request, Response } from 'express';
import { dietWorkoutService } from '../services/diet-workout.service';
import {
  createDietPlanSchema,
  updateDietPlanSchema,
  createWorkoutPlanSchema,
  updateWorkoutPlanSchema,
  planFiltersSchema
} from '../validation/diet-workout.validation';

export const dietWorkoutController = {
  // Diet Plans
  async getDietPlans(req: Request, res: Response) {
    try {
      const filters = planFiltersSchema.parse(req.query);
      const result = await dietWorkoutService.getDietPlans(filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getDietPlan(req: Request, res: Response) {
    try {
      const plan = await dietWorkoutService.getDietPlanById(req.params.id);
      if (!plan) {
        return res.status(404).json({ error: 'Diet plan not found' });
      }
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createDietPlan(req: Request, res: Response) {
    try {
      const data = createDietPlanSchema.parse(req.body);
      const plan = await dietWorkoutService.createDietPlan(data);
      res.status(201).json(plan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateDietPlan(req: Request, res: Response) {
    try {
      const data = updateDietPlanSchema.parse(req.body);
      const plan = await dietWorkoutService.updateDietPlan(req.params.id, data);
      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteDietPlan(req: Request, res: Response) {
    try {
      await dietWorkoutService.deleteDietPlan(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Workout Plans
  async getWorkoutPlans(req: Request, res: Response) {
    try {
      const filters = planFiltersSchema.parse(req.query);
      const result = await dietWorkoutService.getWorkoutPlans(filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getWorkoutPlan(req: Request, res: Response) {
    try {
      const plan = await dietWorkoutService.getWorkoutPlanById(req.params.id);
      if (!plan) {
        return res.status(404).json({ error: 'Workout plan not found' });
      }
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createWorkoutPlan(req: Request, res: Response) {
    try {
      const data = createWorkoutPlanSchema.parse(req.body);
      const plan = await dietWorkoutService.createWorkoutPlan(data);
      res.status(201).json(plan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateWorkoutPlan(req: Request, res: Response) {
    try {
      const data = updateWorkoutPlanSchema.parse(req.body);
      const plan = await dietWorkoutService.updateWorkoutPlan(req.params.id, data);
      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteWorkoutPlan(req: Request, res: Response) {
    try {
      await dietWorkoutService.deleteWorkoutPlan(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};

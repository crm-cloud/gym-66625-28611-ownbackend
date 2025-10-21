import { Request, Response, NextFunction } from 'express';
import { memberGoalsService } from '../services/member-goals.service';
import { createGoalSchema, updateGoalSchema, logProgressSchema, goalsQuerySchema } from '../validation/member-goals.validation';

export class MemberGoalsController {
  async createGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createGoalSchema.parse(req.body);
      const goal = await memberGoalsService.createGoal(data, req.user!.userId);

      res.status(201).json({
        message: 'Goal created successfully',
        goal
      });
    } catch (error) {
      next(error);
    }
  }

  async getGoals(req: Request, res: Response, next: NextFunction) {
    try {
      const query = goalsQuerySchema.parse({
        ...req.query,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50
      });

      const result = await memberGoalsService.getGoals(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const { goalId } = req.params;
      const goal = await memberGoalsService.getGoalById(goalId);
      res.json(goal);
    } catch (error) {
      next(error);
    }
  }

  async updateGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const { goalId } = req.params;
      const data = updateGoalSchema.parse(req.body);
      const goal = await memberGoalsService.updateGoal(goalId, data);

      res.json({
        message: 'Goal updated successfully',
        goal
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const { goalId } = req.params;
      await memberGoalsService.deleteGoal(goalId);

      res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async logProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { goalId } = req.params;
      const data = logProgressSchema.parse(req.body);
      const progress = await memberGoalsService.logProgress(goalId, data);

      res.status(201).json({
        message: 'Progress logged successfully',
        progress
      });
    } catch (error) {
      next(error);
    }
  }

  async getProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { goalId } = req.params;
      const entries = await memberGoalsService.getProgress(goalId);
      res.json(entries);
    } catch (error) {
      next(error);
    }
  }
}

export const memberGoalsController = new MemberGoalsController();

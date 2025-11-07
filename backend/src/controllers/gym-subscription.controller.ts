import { Request, Response, NextFunction } from 'express';
import { gymSubscriptionService } from '../services/gym-subscription.service';

class GymSubscriptionController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { is_active } = req.query;
      const plans = await gymSubscriptionService.getAll(
        is_active === 'true' ? true : is_active === 'false' ? false : undefined
      );
      res.json(plans);
    } catch (error) {
      next(error);
    }
  }
  
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await gymSubscriptionService.getById(req.params.id);
      res.json(plan);
    } catch (error) {
      next(error);
    }
  }
  
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await gymSubscriptionService.create(req.body);
      res.status(201).json(plan);
    } catch (error) {
      next(error);
    }
  }
  
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await gymSubscriptionService.update(req.params.id, req.body);
      res.json(plan);
    } catch (error) {
      next(error);
    }
  }
  
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await gymSubscriptionService.delete(req.params.id);
      res.json({ message: 'Subscription plan deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const gymSubscriptionController = new GymSubscriptionController();

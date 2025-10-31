import { Request, Response, NextFunction } from 'express';
import { gymService } from '../services/gym.service';
import { createGymSchema, updateGymSchema, gymQuerySchema } from '../validation/gym.validation';

export class GymController {
  async createGym(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createGymSchema.parse(req.body);
      const adminUserId = req.user?.userId; // Get from JWT
      const gym = await gymService.createGym(data, adminUserId);
      res.status(201).json({ message: 'Gym created successfully', gym });
    } catch (error) { next(error); }
  }

  async getGyms(req: Request, res: Response, next: NextFunction) {
    try {
      const query = gymQuerySchema.parse({ ...req.query, page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 50, is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined });
      const result = await gymService.getGyms(query);
      res.json(result);
    } catch (error) { next(error); }
  }

  async getGymById(req: Request, res: Response, next: NextFunction) {
    try {
      const gym = await gymService.getGymById(req.params.id);
      res.json(gym);
    } catch (error) { next(error); }
  }

  async updateGym(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateGymSchema.parse(req.body);
      const gym = await gymService.updateGym(req.params.id, data);
      res.json({ message: 'Gym updated successfully', gym });
    } catch (error) { next(error); }
  }

  async deleteGym(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await gymService.deleteGym(req.params.id);
      res.json(result);
    } catch (error) { next(error); }
  }

  async getGymStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await gymService.getGymStats();
      res.json(stats);
    } catch (error) { next(error); }
  }

  async getGymAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await gymService.getGymAnalytics(req.params.id);
      res.json(analytics);
    } catch (error) { next(error); }
  }
}

export const gymController = new GymController();

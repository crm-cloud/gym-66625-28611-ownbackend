import { Request, Response, NextFunction } from 'express';
import { trainerChangeService } from '../services/trainer-change.service';
import { createTrainerChangeSchema, reviewChangeRequestSchema, changeRequestQuerySchema } from '../validation/trainer-change.validation';

export class TrainerChangeController {
  async createChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTrainerChangeSchema.parse(req.body);
      const request = await trainerChangeService.createChangeRequest(data);
      res.status(201).json({ message: 'Change request submitted successfully', request });
    } catch (error) { next(error); }
  }

  async getChangeRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const query = changeRequestQuerySchema.parse({ ...req.query, page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 50 });
      const result = await trainerChangeService.getChangeRequests(query);
      res.json(result);
    } catch (error) { next(error); }
  }

  async getChangeRequestById(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await trainerChangeService.getChangeRequestById(req.params.id);
      res.json(request);
    } catch (error) { next(error); }
  }

  async reviewChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const data = reviewChangeRequestSchema.parse(req.body);
      const request = await trainerChangeService.reviewChangeRequest(req.params.id, data, req.user!.userId);
      res.json({ message: 'Change request reviewed successfully', request });
    } catch (error) { next(error); }
  }

  async getChangeRequestStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await trainerChangeService.getChangeRequestStats();
      res.json(stats);
    } catch (error) { next(error); }
  }
}

export const trainerChangeController = new TrainerChangeController();

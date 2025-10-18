import { Request, Response } from 'express';
import { lockerService } from '../services/locker.service';
import {
  createLockerSchema,
  updateLockerSchema,
  assignLockerSchema,
  lockerFiltersSchema
} from '../validation/locker.validation';

export const lockerController = {
  async getLockers(req: Request, res: Response) {
    try {
      const filters = lockerFiltersSchema.parse(req.query);
      const result = await lockerService.getLockers(filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getLocker(req: Request, res: Response) {
    try {
      const locker = await lockerService.getLockerById(req.params.id);
      if (!locker) {
        return res.status(404).json({ error: 'Locker not found' });
      }
      res.json(locker);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createLocker(req: Request, res: Response) {
    try {
      const data = createLockerSchema.parse(req.body);
      const locker = await lockerService.createLocker(data);
      res.status(201).json(locker);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateLocker(req: Request, res: Response) {
    try {
      const data = updateLockerSchema.parse(req.body);
      const locker = await lockerService.updateLocker(req.params.id, data);
      res.json(locker);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteLocker(req: Request, res: Response) {
    try {
      await lockerService.deleteLocker(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async assignLocker(req: Request, res: Response) {
    try {
      const data = assignLockerSchema.parse(req.body);
      const assignment = await lockerService.assignLocker(req.params.id, data);
      res.status(201).json(assignment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async releaseLocker(req: Request, res: Response) {
    try {
      const { assignmentId } = req.params;
      await lockerService.releaseLocker(req.params.id, assignmentId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};

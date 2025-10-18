import { Request, Response, NextFunction } from 'express';
import { memberProgressService } from '../services/member-progress.service';
import {
  createMeasurementSchema,
  updateMeasurementSchema,
  createGoalSchema,
  updateGoalSchema,
  updateGoalProgressSchema,
  uploadProgressPhotoSchema,
  deleteProgressPhotoSchema,
} from '../validation/member-progress.validation';
import { getFileUrl } from '../config/storage';

export class MemberProgressController {
  // Measurement History
  async createMeasurement(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createMeasurementSchema.parse(req.body);
      const measurement = await memberProgressService.createMeasurement(validatedData);
      res.status(201).json(measurement);
    } catch (error) {
      next(error);
    }
  }

  async getMemberMeasurements(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const measurements = await memberProgressService.getMemberMeasurements(memberId, limit);
      res.json(measurements);
    } catch (error) {
      next(error);
    }
  }

  async getMeasurementById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const measurement = await memberProgressService.getMeasurementById(id);
      
      if (!measurement) {
        return res.status(404).json({ error: 'Measurement not found' });
      }
      
      res.json(measurement);
    } catch (error) {
      next(error);
    }
  }

  async updateMeasurement(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = updateMeasurementSchema.parse({ ...req.body, id: req.params.id });
      const measurement = await memberProgressService.updateMeasurement(validatedData.id, validatedData);
      res.json(measurement);
    } catch (error) {
      next(error);
    }
  }

  async deleteMeasurement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await memberProgressService.deleteMeasurement(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Member Goals
  async createGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createGoalSchema.parse(req.body);
      const goal = await memberProgressService.createGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      next(error);
    }
  }

  async getMemberGoals(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      const status = req.query.status as string | undefined;
      const goals = await memberProgressService.getMemberGoals(memberId, status);
      res.json(goals);
    } catch (error) {
      next(error);
    }
  }

  async getGoalById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const goal = await memberProgressService.getGoalById(id);
      
      if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }
      
      res.json(goal);
    } catch (error) {
      next(error);
    }
  }

  async updateGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = updateGoalSchema.parse({ ...req.body, id: req.params.id });
      const goal = await memberProgressService.updateGoal(validatedData.id, validatedData);
      res.json(goal);
    } catch (error) {
      next(error);
    }
  }

  async updateGoalProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = updateGoalProgressSchema.parse({ ...req.body, id: req.params.id });
      const goal = await memberProgressService.updateGoalProgress(validatedData.id, validatedData.current_value);
      res.json(goal);
    } catch (error) {
      next(error);
    }
  }

  async deleteGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await memberProgressService.deleteGoal(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Progress Summary
  async getProgressSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      const summary = await memberProgressService.getProgressSummary(memberId);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }

  // Progress Photos
  async uploadProgressPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const validatedData = uploadProgressPhotoSchema.parse(req.body);
      const photoUrl = getFileUrl('attachments', req.file.filename);

      const photo = await memberProgressService.saveProgressPhoto({
        member_id: validatedData.member_id,
        photo_url: photoUrl,
        photo_type: validatedData.photo_type,
        notes: validatedData.notes,
      });

      res.status(201).json(photo);
    } catch (error) {
      next(error);
    }
  }

  async getMemberProgressPhotos(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      const photos = await memberProgressService.getMemberProgressPhotos(memberId);
      res.json(photos);
    } catch (error) {
      next(error);
    }
  }

  async deleteProgressPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await memberProgressService.deleteProgressPhoto(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const memberProgressController = new MemberProgressController();

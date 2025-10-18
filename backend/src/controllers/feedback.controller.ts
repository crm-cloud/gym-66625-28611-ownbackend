import { Request, Response } from 'express';
import { feedbackService } from '../services/feedback.service';
import {
  createFeedbackSchema,
  updateFeedbackSchema,
  feedbackFiltersSchema
} from '../validation/feedback.validation';

export const feedbackController = {
  async getFeedback(req: Request, res: Response) {
    try {
      const filters = feedbackFiltersSchema.parse(req.query);
      const result = await feedbackService.getFeedback(filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getFeedbackById(req: Request, res: Response) {
    try {
      const feedback = await feedbackService.getFeedbackById(req.params.id);
      if (!feedback) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      res.json(feedback);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createFeedback(req: Request, res: Response) {
    try {
      const data = createFeedbackSchema.parse(req.body);
      const feedback = await feedbackService.createFeedback(data);
      res.status(201).json(feedback);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateFeedback(req: Request, res: Response) {
    try {
      const data = updateFeedbackSchema.parse(req.body);
      const feedback = await feedbackService.updateFeedback(req.params.id, data);
      res.json(feedback);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};

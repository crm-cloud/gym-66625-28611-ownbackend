import { Request, Response, NextFunction } from 'express';
import { trainerReviewService } from '../services/trainer-review.service';
import { createTrainerReviewSchema, updateTrainerReviewSchema, reviewQuerySchema } from '../validation/trainer-review.validation';

export class TrainerReviewController {
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTrainerReviewSchema.parse(req.body);
      const review = await trainerReviewService.createReview(data);
      res.status(201).json({ message: 'Review submitted successfully', review });
    } catch (error) { next(error); }
  }

  async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const query = reviewQuerySchema.parse({ ...req.query, page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 50, is_verified: req.query.is_verified === 'true' ? true : req.query.is_verified === 'false' ? false : undefined, is_featured: req.query.is_featured === 'true' ? true : req.query.is_featured === 'false' ? false : undefined });
      const result = await trainerReviewService.getReviews(query);
      res.json(result);
    } catch (error) { next(error); }
  }

  async getReviewById(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await trainerReviewService.getReviewById(req.params.id);
      res.json(review);
    } catch (error) { next(error); }
  }

  async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateTrainerReviewSchema.parse(req.body);
      const review = await trainerReviewService.updateReview(req.params.id, data);
      res.json({ message: 'Review updated successfully', review });
    } catch (error) { next(error); }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await trainerReviewService.deleteReview(req.params.id);
      res.json(result);
    } catch (error) { next(error); }
  }

  async getTrainerReviewSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await trainerReviewService.getTrainerReviewSummary(req.params.trainerId);
      res.json(summary);
    } catch (error) { next(error); }
  }
}

export const trainerReviewController = new TrainerReviewController();

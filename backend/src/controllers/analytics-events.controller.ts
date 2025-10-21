import { Request, Response, NextFunction } from 'express';
import { analyticsEventsService } from '../services/analytics-events.service';
import { trackEventSchema, eventsQuerySchema, analyticsQuerySchema } from '../validation/analytics-events.validation';

export class AnalyticsEventsController {
  async trackEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const data = trackEventSchema.parse(req.body);
      const event = await analyticsEventsService.trackEvent(data);

      res.status(201).json({
        message: 'Event tracked successfully',
        event
      });
    } catch (error) {
      next(error);
    }
  }

  async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const query = eventsQuerySchema.parse({
        ...req.query,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50
      });

      const result = await analyticsEventsService.getEvents(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const query = analyticsQuerySchema.parse({
        entity_type: req.params.entityType,
        entity_id: req.params.entityId,
        from_date: req.query.from_date,
        to_date: req.query.to_date
      });

      let result;
      switch (query.entity_type) {
        case 'member':
          result = await analyticsEventsService.getMemberAnalytics(query);
          break;
        case 'branch':
          result = await analyticsEventsService.getBranchAnalytics(query);
          break;
        case 'trainer':
          result = await analyticsEventsService.getTrainerAnalytics(query);
          break;
        default:
          throw new Error('Invalid entity type');
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsEventsController = new AnalyticsEventsController();

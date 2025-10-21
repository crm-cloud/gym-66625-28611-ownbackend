import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';

export class AnalyticsController {
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { gymId, branchId, startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const stats = await analyticsService.getDashboardStats(
        gymId as string,
        branchId as string,
        start,
        end
      );

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getRevenueAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { gymId, branchId, startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const revenue = await analyticsService.getRevenueAnalytics(
        gymId as string,
        branchId as string,
        start,
        end
      );

      res.json(revenue);
    } catch (error) {
      next(error);
    }
  }

  async getMembershipAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { gymId, branchId, startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const memberships = await analyticsService.getMembershipAnalytics(
        gymId as string,
        branchId as string,
        start,
        end
      );

      res.json(memberships);
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { gymId, branchId, startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const attendance = await analyticsService.getAttendanceAnalytics(
        gymId as string,
        branchId as string,
        start,
        end
      );

      res.json(attendance);
    } catch (error) {
      next(error);
    }
  }

  async getClassPopularity(req: Request, res: Response, next: NextFunction) {
    try {
      const { gymId, branchId, startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const classes = await analyticsService.getClassPopularity(
        gymId as string,
        branchId as string,
        start,
        end
      );

      res.json(classes);
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();

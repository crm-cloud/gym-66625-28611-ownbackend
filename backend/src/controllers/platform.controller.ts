import { Request, Response, NextFunction } from 'express';
import { platformService } from '../services/platform.service';

export class PlatformController {
  /**
   * Get platform-wide analytics
   */
  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { from_date, to_date } = req.query;
      const analytics = await platformService.getAnalytics(
        from_date as string,
        to_date as string
      );
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get platform reports
   */
  async getReports(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, from_date, to_date } = req.query;
      const reports = await platformService.getReports(
        type as string,
        from_date as string,
        to_date as string
      );
      res.json(reports);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get total revenue across all gyms
   */
  async getRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const { from_date, to_date } = req.query;
      const revenue = await platformService.getTotalRevenue(
        from_date as string,
        to_date as string
      );
      res.json(revenue);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get total members across all gyms
   */
  async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await platformService.getTotalMembers();
      res.json(members);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all gyms with metrics
   */
  async getGyms(req: Request, res: Response, next: NextFunction) {
    try {
      const gyms = await platformService.getAllGymsWithMetrics();
      res.json(gyms);
    } catch (error) {
      next(error);
    }
  }
}

export const platformController = new PlatformController();

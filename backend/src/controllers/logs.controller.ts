import { Request, Response, NextFunction } from 'express';
import { logsService } from '../services/logs.service';

export class LogsController {
  /**
   * Get email logs
   */
  async getEmailLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string,
        from_date: req.query.from_date as string,
        to_date: req.query.to_date as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50
      };

      const logs = await logsService.getEmailLogs(filters);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get SMS logs
   */
  async getSMSLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string,
        from_date: req.query.from_date as string,
        to_date: req.query.to_date as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50
      };

      const logs = await logsService.getSMSLogs(filters);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        action: req.query.action as string,
        user_id: req.query.user_id as string,
        from_date: req.query.from_date as string,
        to_date: req.query.to_date as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50
      };

      const logs = await logsService.getAuditLogs(filters);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }
}

export const logsController = new LogsController();

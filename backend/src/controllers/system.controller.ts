import { Request, Response, NextFunction } from 'express';
import { systemService } from '../services/system.service';

export class SystemController {
  /**
   * Get detailed system health
   */
  async getDetailedHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const health = await systemService.getDetailedHealth();
      res.json(health);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get backups
   */
  async getBackups(req: Request, res: Response, next: NextFunction) {
    try {
      const backups = await systemService.getBackups();
      res.json(backups);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create backup
   */
  async createBackup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await systemService.createBackup(req.user!.userId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore backup
   */
  async restoreBackup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await systemService.restoreBackup(id, req.user!.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get system logs
   */
  async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { level, from_date, to_date, limit } = req.query;
      const logs = await systemService.getLogs({
        level: level as string,
        from_date: from_date as string,
        to_date: to_date as string,
        limit: limit ? Number(limit) : 100
      });
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }
}

export const systemController = new SystemController();

import { Request, Response, NextFunction } from 'express';
import { settingsService } from '../services/settings.service';

export class SettingsController {
  /**
   * Get all settings for current user context
   */
  async getAllSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const userRole = req.user?.role;
      const gymId = req.user?.gymId;
      const branchId = req.user?.branchId;

      const settings = await settingsService.getAllSettings(userRole, gymId, branchId);
      res.json(settings);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get settings by category
   */
  async getSettingsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.params;
      const userRole = req.user?.role;
      const gymId = req.user?.gymId;
      const branchId = req.user?.branchId;

      // Sensitive categories require super_admin
      const sensitiveCategories = ['security', 'api', 'system'];
      if (sensitiveCategories.includes(category) && userRole !== 'super_admin') {
        const ApiError = (await import('../utils/ApiError.js')).ApiError;
        throw new ApiError('Insufficient permissions to view this category', 403);
      }

      const settings = await settingsService.getSettingsByCategory(
        category,
        userRole,
        gymId,
        branchId
      );

      res.json(settings);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update settings
   */
  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.params;
      const userRole = req.user?.role;
      const gymId = req.user?.gymId;
      const branchId = req.user?.branchId;

      const result = await settingsService.updateSettings(
        category,
        req.body,
        userRole,
        gymId,
        branchId
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test settings (send test email/SMS)
   */
  async testSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.params;
      const result = await settingsService.testSettings(category, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const settingsController = new SettingsController();

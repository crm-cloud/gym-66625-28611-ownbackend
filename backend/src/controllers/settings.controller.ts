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

      // CRITICAL: Super admin can only see platform settings
      if (userRole === 'super_admin' && (gymId || branchId)) {
        const ApiError = (await import('../utils/ApiError.js')).ApiError;
        throw new ApiError('Super admin account should not have gym_id or branch_id', 500);
      }

      // CRITICAL: Admin must have gym_id
      if (userRole === 'admin' && !gymId) {
        const ApiError = (await import('../utils/ApiError.js')).ApiError;
        throw new ApiError('Admin must be associated with a gym', 403);
      }

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

      // CRITICAL: Validate user context
      if (userRole === 'super_admin') {
        if (gymId || branchId) {
          const ApiError = (await import('../utils/ApiError.js')).ApiError;
          throw new ApiError('Super admin should not have gym_id or branch_id', 500);
        }
      } else if (userRole === 'admin') {
        if (!gymId) {
          const ApiError = (await import('../utils/ApiError.js')).ApiError;
          throw new ApiError('Admin must be associated with a gym', 403);
        }
      } else {
        const ApiError = (await import('../utils/ApiError.js')).ApiError;
        throw new ApiError('Only admin and super_admin can update settings', 403);
      }

      // Sensitive categories require super_admin
      const sensitiveCategories = ['security', 'api', 'system'];
      if (sensitiveCategories.includes(category) && userRole !== 'super_admin') {
        const ApiError = (await import('../utils/ApiError.js')).ApiError;
        throw new ApiError('Insufficient permissions to update this category', 403);
      }

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

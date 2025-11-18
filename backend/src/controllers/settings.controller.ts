import { Request, Response, NextFunction } from 'express';
import { settingsService } from '../services/settings.service';
import { transformDatabaseToFrontend, transformFrontendToDatabase } from '../utils/settingsTransformer';

export class SettingsController {
  /**
   * Get all settings for current user context
   */
  async getAllSettings(req: Request, res: Response, next: NextFunction) {
    try {
      // If category is provided as query param, delegate to getSettingsByCategory
      if (req.query.category) {
        return this.getSettingsByCategory(req, res, next);
      }
      
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
      // Support both path parameter and query parameter for category
      const category = req.params.category || (req.query.category as string);
      
      if (!category) {
        const ApiError = (await import('../utils/ApiError.js')).ApiError;
        throw new ApiError('Category is required', 400);
      }
      
      const userRole = req.user?.role;
      const gymId = req.user?.gymId;
      const branchId = req.user?.branchId;

      // Super admins should ignore gym_id/branch_id if accidentally set
      if (userRole === 'super_admin') {
        gymId = undefined;
        branchId = undefined;
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

      const dbSettings = await settingsService.getSettingsByCategory(
        category,
        userRole,
        gymId,
        branchId
      );

      // Transform database format to frontend format (array of key-value pairs)
      // Handle both real database records and default settings
      let frontendSettings: any = [];
      
      if (dbSettings && dbSettings.id) {
        // Real database record - transform it
        frontendSettings = transformDatabaseToFrontend(dbSettings);
      } else if (dbSettings && dbSettings.config) {
        // Default settings object - convert to array format
        frontendSettings = Object.entries(dbSettings.config).map(([key, value]) => ({
          id: '',
          category: dbSettings.category,
          key,
          value,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
      }

      res.json(frontendSettings);
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
        // Super admins should ignore gym_id/branch_id if accidentally set
        gymId = undefined;
        branchId = undefined;
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

      // Transform frontend format to database format
      const dbConfig = transformFrontendToDatabase(req.body);

      const result = await settingsService.updateSettings(
        category,
        dbConfig,
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

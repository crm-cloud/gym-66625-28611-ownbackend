import { Request, Response, NextFunction } from 'express';
import { adminManagementService } from '../services/admin-management.service';
import { ApiError } from '../middleware/errorHandler';
import { z } from 'zod';

// Validation schemas
const createAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().regex(/^[0-9+\-\s()]{10,15}$/, 'Invalid phone number').optional(),
  subscription_plan_id: z.string().uuid('Invalid subscription plan ID'),
});

const createGymSchema = z.object({
  gym_name: z.string().min(2, 'Gym name must be at least 2 characters').max(255),
});

class AdminManagementController {
  /**
   * Super Admin creates Admin account
   * POST /api/v1/admin-management/create-admin
   */
  async createAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== 'super_admin') {
        throw new ApiError('Only super admins can create admin accounts', 403);
      }

      const validatedData = createAdminSchema.parse(req.body);

      const result = await adminManagementService.createAdmin({
        ...validatedData,
        created_by: req.user.userId
      });

      res.status(201).json({
        message: 'Admin account created successfully',
        admin: result.admin,
        tempPassword: result.tempPassword,
        subscription: result.subscriptionPlan,
        important: 'Send this temporary password to the admin securely. They must change it on first login.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin creates their gym
   * POST /api/v1/admin-management/create-gym
   */
  async createGym(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw new ApiError('Only admins can create gyms', 403);
      }

      const validatedData = createGymSchema.parse(req.body);

      const result = await adminManagementService.createGym({
        admin_id: req.user.userId,
        gym_name: validatedData.gym_name
      });

      res.status(201).json({
        message: 'Gym created successfully',
        gym: result.gym,
        subscription: result.subscription
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get admin's subscription details
   * GET /api/v1/admin-management/subscription
   */
  async getSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw new ApiError('Only admins can view their subscription', 403);
      }

      const subscription = await adminManagementService.getAdminSubscription(req.user.userId);

      res.json({
        subscription: {
          plan_name: subscription.subscription_plan.name,
          max_branches: subscription.subscription_plan.max_branches,
          max_members: subscription.subscription_plan.max_members,
          max_staff: subscription.subscription_plan.max_staff,
          features: subscription.subscription_plan.features,
          assigned_at: subscription.assigned_at,
          assigned_by: subscription.assigner?.full_name,
          status: subscription.status
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminManagementController = new AdminManagementController();

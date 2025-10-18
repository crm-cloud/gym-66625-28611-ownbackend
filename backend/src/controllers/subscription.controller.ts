import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../services/subscription.service';
import { 
  createSubscriptionSchema,
  updateSubscriptionSchema,
  freezeSubscriptionSchema,
  renewSubscriptionSchema,
  subscriptionQuerySchema,
  billingCycleQuerySchema
} from '../validation/subscription.validation';

export class SubscriptionController {
  /**
   * Create subscription
   */
  async createSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSubscriptionSchema.parse(req.body);
      const result = await subscriptionService.createSubscription(data, req.user!.userId);

      res.status(201).json({
        message: 'Subscription created successfully',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get subscriptions
   */
  async getSubscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const query = subscriptionQuerySchema.parse({
        ...req.query,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50,
        expiring_in_days: req.query.expiring_in_days ? Number(req.query.expiring_in_days) : undefined
      });

      const result = await subscriptionService.getSubscriptions(
        query,
        req.user!.role,
        req.user!.branchId
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateSubscriptionSchema.parse(req.body);
      const result = await subscriptionService.updateSubscription(id, data);

      res.json({
        message: 'Subscription updated successfully',
        subscription: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Freeze subscription
   */
  async freezeSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = freezeSubscriptionSchema.parse(req.body);
      const result = await subscriptionService.freezeSubscription(id, data);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unfreeze subscription
   */
  async unfreezeSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await subscriptionService.unfreezeSubscription(id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Renew subscription
   */
  async renewSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = renewSubscriptionSchema.parse(req.body);
      const result = await subscriptionService.renewSubscription(id, data, req.user!.userId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { branch_id } = req.query;
      const stats = await subscriptionService.getSubscriptionStats(branch_id as string);

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get billing cycle report
   */
  async getBillingCycleReport(req: Request, res: Response, next: NextFunction) {
    try {
      const query = billingCycleQuerySchema.parse(req.query);
      const report = await subscriptionService.getBillingCycleReport(query);

      res.json(report);
    } catch (error) {
      next(error);
    }
  }
}

export const subscriptionController = new SubscriptionController();

import { Request, Response, NextFunction } from 'express';
import { adminSubscriptionService } from '../services/admin-subscription.service';

class AdminSubscriptionController {
  async getAllSubscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, admin_id } = req.query;
      const subscriptions = await adminSubscriptionService.getAllSubscriptions({
        status: status as string,
        admin_id: admin_id as string
      });
      res.json(subscriptions);
    } catch (error) {
      next(error);
    }
  }

  async getSubscriptionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const subscription = await adminSubscriptionService.getSubscriptionById(id);
      res.json(subscription);
    } catch (error) {
      next(error);
    }
  }

  async assignSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { admin_id, subscription_plan_id, notes } = req.body;
      const assignedBy = req.user?.userId;
      
      const subscription = await adminSubscriptionService.assignSubscription({
        admin_id,
        subscription_plan_id,
        assigned_by: assignedBy!,
        notes
      });
      
      res.status(201).json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  }

  async updateSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const subscription = await adminSubscriptionService.updateSubscription(id, updates);
      
      res.json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  }

  async cancelSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      await adminSubscriptionService.cancelSubscription(id, reason);
      
      res.json({ success: true, message: 'Subscription cancelled successfully' });
    } catch (error) {
      next(error);
    }
  }

  async renewSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { subscription_plan_id } = req.body;
      
      const subscription = await adminSubscriptionService.renewSubscription(id, subscription_plan_id);
      
      res.json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  }
}

export const adminSubscriptionController = new AdminSubscriptionController();

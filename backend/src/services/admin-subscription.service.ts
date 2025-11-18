import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';

class AdminSubscriptionService {
  async getAllSubscriptions(filters: { status?: string; admin_id?: string }) {
    const where: any = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.admin_id) {
      where.admin_id = filters.admin_id;
    }
    
    return await prisma.admin_subscriptions.findMany({
      where,
      include: {
        subscription_plans: true,
        profiles: {
          select: {
            user_id: true,
            email: true,
            full_name: true
          }
        }
      },
      orderBy: { assigned_at: 'desc' }
    });
  }

  async getSubscriptionById(id: string) {
    const subscription = await prisma.admin_subscriptions.findUnique({
      where: { id },
      include: {
        subscription_plans: true,
        profiles: {
          select: {
            user_id: true,
            email: true,
            full_name: true
          }
        }
      }
    });
    
    if (!subscription) {
      throw new ApiError('Subscription not found', 404);
    }
    
    return subscription;
  }

  async assignSubscription(data: {
    admin_id: string;
    subscription_plan_id: string;
    assigned_by: string;
    notes?: string;
  }) {
    // Validate admin exists and has admin role
    const admin = await prisma.profiles.findUnique({
      where: { user_id: data.admin_id },
      include: { 
        user_roles: {
          where: {
            role: 'admin'
          }
        }
      }
    });
    
    if (!admin || admin.user_roles.length === 0) {
      throw new ApiError('Invalid admin user or user does not have admin role', 400);
    }
    
    // Check if subscription plan exists and is active
    const plan = await prisma.subscription_plans.findUnique({
      where: { id: data.subscription_plan_id }
    });
    
    if (!plan) {
      throw new ApiError('Invalid subscription plan', 400);
    }
    
    if (!plan.is_active) {
      throw new ApiError('Cannot assign inactive subscription plan', 400);
    }
    
    // Check for existing active subscription
    const existing = await prisma.admin_subscriptions.findFirst({
      where: {
        admin_id: data.admin_id,
        status: 'active'
      }
    });
    
    if (existing) {
      throw new ApiError('Admin already has an active subscription. Please cancel the existing one first.', 400);
    }
    
    // Create subscription
    const subscription = await prisma.admin_subscriptions.create({
      data: {
        admin_id: data.admin_id,
        subscription_plan_id: data.subscription_plan_id,
        assigned_by: data.assigned_by,
        notes: data.notes,
        status: 'active',
        assigned_at: new Date()
      },
      include: {
        subscription_plans: true,
        profiles: {
          select: {
            user_id: true,
            email: true,
            full_name: true
          }
        }
      }
    });
    
    console.log(`[AdminSubscription] Assigned plan "${plan.name}" to admin ${admin.email}`);
    
    return subscription;
  }

  async updateSubscription(id: string, updates: any) {
    await this.getSubscriptionById(id); // Check exists
    
    return await prisma.admin_subscriptions.update({
      where: { id },
      data: {
        subscription_plan_id: updates.subscription_plan_id,
        status: updates.status,
        notes: updates.notes,
        updated_at: new Date()
      },
      include: {
        subscription_plans: true,
        profiles: true
      }
    });
  }

  async cancelSubscription(id: string, reason?: string) {
    await this.getSubscriptionById(id); // Check exists
    
    return await prisma.admin_subscriptions.update({
      where: { id },
      data: {
        status: 'cancelled',
        notes: reason || 'Cancelled by super admin',
        updated_at: new Date()
      }
    });
  }

  async renewSubscription(id: string, newPlanId?: string) {
    const currentSubscription = await this.getSubscriptionById(id);
    
    const planId = newPlanId || currentSubscription.subscription_plan_id;
    
    // Validate new plan if changing
    if (newPlanId) {
      const plan = await prisma.subscription_plans.findUnique({
        where: { id: newPlanId }
      });
      
      if (!plan || !plan.is_active) {
        throw new ApiError('Invalid subscription plan', 400);
      }
    }
    
    return await prisma.admin_subscriptions.update({
      where: { id },
      data: {
        subscription_plan_id: planId,
        status: 'active',
        assigned_at: new Date(), // Reset assignment date on renewal
        updated_at: new Date()
      },
      include: {
        subscription_plans: true,
        profiles: true
      }
    });
  }
}

export const adminSubscriptionService = new AdminSubscriptionService();

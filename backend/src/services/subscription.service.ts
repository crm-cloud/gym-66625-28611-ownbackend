import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { 
  CreateSubscriptionInput, 
  UpdateSubscriptionInput,
  FreezeSubscriptionInput,
  RenewSubscriptionInput,
  SubscriptionQueryInput,
  BillingCycleQueryInput
} from '../validation/subscription.validation';

export class SubscriptionService {
  /**
   * Create subscription
   */
  async createSubscription(data: CreateSubscriptionInput, createdBy: string) {
    const { member_id, membership_plan_id, start_date, payment_method, discount_amount, notes } = data;

    // Verify member exists
    const member = await prisma.members.findUnique({
      where: { id: member_id }
    });

    if (!member) {
      throw new ApiError('Member not found', 404);
    }

    // Get membership plan
    const plan = await prisma.membership_plans.findUnique({
      where: { id: membership_plan_id }
    });

    if (!plan) {
      throw new ApiError('Membership plan not found', 404);
    }

    // Calculate dates
    const startDate = start_date ? new Date(start_date) : new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + (plan.duration_months || 1));

    // Calculate amount
    const baseAmount = Number(plan.price);
    const discountAmt = discount_amount || 0;
    const finalAmount = baseAmount - discountAmt;

    // Update member with new membership
    const updatedMember = await prisma.members.update({
      where: { id: member_id },
      data: {
        membership_plan_id,
        membership_start_date: startDate.toISOString(),
        membership_end_date: endDate.toISOString(),
        status: 'active'
      },
      include: {
        membership_plans: true,
        branches: {
          select: { name: true }
        }
      }
    });

    return {
      subscription: updatedMember,
      subscription_details: {
        start_date: startDate,
        end_date: endDate,
        plan_name: plan.name,
        base_amount: baseAmount,
        discount_amount: discountAmt,
        final_amount: finalAmount
      }
    };
  }

  /**
   * Get subscriptions with filters
   */
  async getSubscriptions(query: SubscriptionQueryInput, userRole: string, userBranchId?: string | null) {
    const { member_id, branch_id, status, expiring_in_days, page = 1, limit = 50 } = query;

    const where: any = {};

    // Branch filtering
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      where.branch_id = userBranchId;
    } else if (branch_id) {
      where.branch_id = branch_id;
    }

    if (member_id) {
      where.id = member_id;
    }

    if (status) {
      where.status = status;
    }

    // Filter by expiring soon
    if (expiring_in_days) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + expiring_in_days);
      where.membership_end_date = {
        lte: futureDate.toISOString(),
        gte: new Date().toISOString()
      };
    }

    const [subscriptions, total] = await Promise.all([
      prisma.members.findMany({
        where,
        include: {
          membership_plans: true,
          branches: {
            select: { name: true, id: true }
          },
          trainer_profiles: {
            select: { name: true, id: true }
          }
        },
        orderBy: { membership_end_date: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.members.count({ where })
    ]);

    return {
      data: subscriptions.map(sub => ({
        ...sub,
        days_remaining: this.calculateDaysRemaining(sub.membership_end_date),
        is_expired: sub.membership_end_date ? new Date(sub.membership_end_date) < new Date() : false
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update subscription
   */
  async updateSubscription(memberId: string, data: UpdateSubscriptionInput) {
    const member = await prisma.members.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      throw new ApiError('Member not found', 404);
    }

    const updated = await prisma.members.update({
      where: { id: memberId },
      data: {
        membership_end_date: data.end_date,
        status: data.status,
        notes: data.notes
      },
      include: {
        membership_plans: true
      }
    });

    return updated;
  }

  /**
   * Freeze subscription
   */
  async freezeSubscription(memberId: string, data: FreezeSubscriptionInput) {
    const member = await prisma.members.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      throw new ApiError('Member not found', 404);
    }

    if (!member.membership_end_date) {
      throw new ApiError('Member has no active subscription', 400);
    }

    const freezeFrom = new Date(data.freeze_from);
    const freezeTo = new Date(data.freeze_to);
    const freezeDays = Math.ceil((freezeTo.getTime() - freezeFrom.getTime()) / (1000 * 60 * 60 * 24));

    // Extend end date by freeze period
    const currentEndDate = new Date(member.membership_end_date);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + freezeDays);

    const updated = await prisma.members.update({
      where: { id: memberId },
      data: {
        membership_end_date: newEndDate.toISOString(),
        status: 'frozen'
      }
    });

    return {
      message: 'Subscription frozen successfully',
      freeze_days: freezeDays,
      new_end_date: newEndDate,
      member: updated
    };
  }

  /**
   * Unfreeze subscription
   */
  async unfreezeSubscription(memberId: string) {
    const updated = await prisma.members.update({
      where: { id: memberId },
      data: {
        status: 'active'
      }
    });

    return {
      message: 'Subscription unfrozen successfully',
      member: updated
    };
  }

  /**
   * Renew subscription
   */
  async renewSubscription(memberId: string, data: RenewSubscriptionInput, renewedBy: string) {
    const member = await prisma.members.findUnique({
      where: { id: memberId },
      include: {
        membership_plans: true
      }
    });

    if (!member) {
      throw new ApiError('Member not found', 404);
    }

    // Use new plan or keep existing
    const planId = data.membership_plan_id || member.membership_plan_id;
    const plan = await prisma.membership_plans.findUnique({
      where: { id: planId || '' }
    });

    if (!plan) {
      throw new ApiError('Membership plan not found', 404);
    }

    // Calculate new dates
    const currentEndDate = member.membership_end_date ? new Date(member.membership_end_date) : new Date();
    const startDate = currentEndDate > new Date() ? currentEndDate : new Date();
    const newEndDate = new Date(startDate);
    newEndDate.setMonth(newEndDate.getMonth() + (plan.duration_months || 1));

    // Calculate amount
    const baseAmount = Number(plan.price);
    const discountAmt = data.discount_amount || 0;
    const finalAmount = baseAmount - discountAmt;

    // Update member
    const updated = await prisma.members.update({
      where: { id: memberId },
      data: {
        membership_plan_id: planId,
        membership_start_date: startDate.toISOString(),
        membership_end_date: newEndDate.toISOString(),
        status: 'active'
      },
      include: {
        membership_plans: true
      }
    });

    return {
      message: 'Subscription renewed successfully',
      subscription: updated,
      renewal_details: {
        start_date: startDate,
        end_date: newEndDate,
        plan_name: plan.name,
        base_amount: baseAmount,
        discount_amount: discountAmt,
        final_amount: finalAmount
      }
    };
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats(branchId?: string) {
    const where: any = {};
    if (branchId) {
      where.branch_id = branchId;
    }

    const [total, active, expired, expiringSoon] = await Promise.all([
      prisma.members.count({ 
        where: { ...where, membership_end_date: { not: null } } 
      }),
      prisma.members.count({ 
        where: { 
          ...where, 
          status: 'active',
          membership_end_date: { gte: new Date().toISOString() }
        } 
      }),
      prisma.members.count({ 
        where: { 
          ...where,
          membership_end_date: { lt: new Date().toISOString() }
        } 
      }),
      prisma.members.count({
        where: {
          ...where,
          status: 'active',
          membership_end_date: {
            gte: new Date().toISOString(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        }
      })
    ]);

    return {
      total,
      active,
      expired,
      expiring_soon: expiringSoon
    };
  }

  /**
   * Get billing cycle report
   */
  async getBillingCycleReport(query: BillingCycleQueryInput) {
    const { branch_id, from_date, to_date } = query;

    let whereConditions: string[] = [
      `membership_start_date >= '${from_date}'`,
      `membership_start_date <= '${to_date}'`
    ];

    if (branch_id) {
      whereConditions.push(`branch_id = '${branch_id}'`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const report = await prisma.$queryRawUnsafe(`
      SELECT 
        mp.name as plan_name,
        COUNT(m.id)::int as subscription_count,
        SUM(mp.price)::decimal as total_revenue,
        AVG(mp.price)::decimal as average_price
      FROM members m
      INNER JOIN membership_plans mp ON m.membership_plan_id = mp.id
      ${whereClause}
      GROUP BY mp.name, mp.id
      ORDER BY total_revenue DESC
    `);

    return report;
  }

  /**
   * Helper: Calculate days remaining
   */
  private calculateDaysRemaining(endDate: string | null): number {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}

export const subscriptionService = new SubscriptionService();

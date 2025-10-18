import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { CreateMembershipPlanInput, UpdateMembershipPlanInput, MembershipPlanQueryInput } from '../validation/membership.validation';

export class MembershipService {
  /**
   * Get all membership plans with filters
   */
  async getMembershipPlans(query: MembershipPlanQueryInput) {
    const { branch_id, is_active, category, min_price, max_price } = query;

    const where: any = {};

    if (branch_id) {
      where.branch_id = branch_id;
    }

    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    if (category) {
      where.category = category;
    }

    if (min_price !== undefined || max_price !== undefined) {
      where.price = {};
      if (min_price !== undefined) {
        where.price.gte = min_price;
      }
      if (max_price !== undefined) {
        where.price.lte = max_price;
      }
    }

    const plans = await prisma.membership_plans.findMany({
      where,
      include: {
        branches: {
          select: { name: true, id: true }
        },
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: { price: 'asc' }
    });

    return plans;
  }

  /**
   * Get single membership plan by ID
   */
  async getMembershipPlanById(id: string) {
    const plan = await prisma.membership_plans.findUnique({
      where: { id },
      include: {
        branches: true,
        _count: {
          select: {
            members: true
          }
        }
      }
    });

    if (!plan) {
      throw new ApiError('Membership plan not found', 404);
    }

    return plan;
  }

  /**
   * Create new membership plan
   */
  async createMembershipPlan(data: CreateMembershipPlanInput) {
    // Verify branch exists if provided
    if (data.branch_id) {
      const branch = await prisma.branches.findUnique({
        where: { id: data.branch_id }
      });

      if (!branch) {
        throw new ApiError('Branch not found', 404);
      }
    }

    const plan = await prisma.membership_plans.create({
      data,
      include: {
        branches: {
          select: { name: true }
        }
      }
    });

    return plan;
  }

  /**
   * Update membership plan
   */
  async updateMembershipPlan(id: string, data: UpdateMembershipPlanInput) {
    await this.getMembershipPlanById(id);

    const plan = await prisma.membership_plans.update({
      where: { id },
      data,
      include: {
        branches: {
          select: { name: true }
        }
      }
    });

    return plan;
  }

  /**
   * Delete membership plan
   */
  async deleteMembershipPlan(id: string) {
    const plan = await this.getMembershipPlanById(id);

    // Check if plan has active members
    const memberCount = await prisma.members.count({
      where: { membership_plan_id: id }
    });

    if (memberCount > 0) {
      throw new ApiError('Cannot delete membership plan with active members', 400);
    }

    await prisma.membership_plans.delete({
      where: { id }
    });

    return { message: 'Membership plan deleted successfully' };
  }

  /**
   * Get popular plans
   */
  async getPopularPlans(limit: number = 5) {
    const plans = await prisma.membership_plans.findMany({
      where: { is_active: true },
      include: {
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: {
        members: {
          _count: 'desc'
        }
      },
      take: limit
    });

    return plans;
  }
}

export const membershipService = new MembershipService();

import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { CreateGymInput, UpdateGymInput, GymQueryInput } from '../validation/gym.validation';

export class GymService {
  /**
   * Get all gyms with filters (Super Admin only)
   */
  async getGyms(query: GymQueryInput) {
    const { subscription_plan, is_active, search, page = 1, limit = 50 } = query;

    const where: any = {};

    if (subscription_plan) where.subscription_plan = subscription_plan;
    if (is_active !== undefined) where.is_active = is_active;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [gyms, total] = await Promise.all([
      prisma.gyms.findMany({
        where,
        include: {
          _count: {
            select: {
              branches: true,
              profiles: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.gyms.count({ where })
    ]);

    return {
      data: gyms.map(gym => ({
        ...gym,
        branch_count: gym._count.branches,
        member_count: gym._count.profiles
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
   * Get gym by ID
   */
  async getGymById(id: string) {
    const gym = await prisma.gyms.findUnique({
      where: { id },
      include: {
        branches: {
          select: {
            id: true,
            name: true,
            city: true,
            is_active: true
          }
        },
        _count: {
          select: {
            branches: true,
            profiles: true
          }
        }
      }
    });

    if (!gym) {
      throw new ApiError('Gym not found', 404);
    }

    return {
      ...gym,
      branch_count: gym._count.branches,
      member_count: gym._count.profiles
    };
  }

  /**
   * Create new gym
   */
  async createGym(data: CreateGymInput) {
    // Check if email already exists
    const existingGym = await prisma.gyms.findUnique({
      where: { email: data.email }
    });

    if (existingGym) {
      throw new ApiError('Gym with this email already exists', 400);
    }

    // Calculate subscription dates
    const subscriptionStartDate = data.subscription_start_date 
      ? new Date(data.subscription_start_date) 
      : new Date();

    const subscriptionEndDate = data.subscription_end_date 
      ? new Date(data.subscription_end_date)
      : new Date(subscriptionStartDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

    const gym = await prisma.gyms.create({
      data: {
        ...data,
        subscription_start_date: subscriptionStartDate.toISOString(),
        subscription_end_date: subscriptionEndDate.toISOString()
      }
    });

    return gym;
  }

  /**
   * Update gym
   */
  async updateGym(id: string, data: UpdateGymInput) {
    await this.getGymById(id);

    const gym = await prisma.gyms.update({
      where: { id },
      data
    });

    return gym;
  }

  /**
   * Delete gym
   */
  async deleteGym(id: string) {
    const gym = await this.getGymById(id);

    // Check if gym has branches
    if (gym.branch_count > 0) {
      throw new ApiError('Cannot delete gym with active branches', 400);
    }

    await prisma.gyms.delete({
      where: { id }
    });

    return { message: 'Gym deleted successfully' };
  }

  /**
   * Get gym statistics
   */
  async getGymStats() {
    const [total, active, byPlan] = await Promise.all([
      prisma.gyms.count(),
      prisma.gyms.count({ where: { is_active: true } }),
      prisma.gyms.groupBy({
        by: ['subscription_plan'],
        _count: true
      })
    ]);

    return {
      total,
      active,
      by_plan: byPlan.map(p => ({
        plan: p.subscription_plan,
        count: p._count
      }))
    };
  }

  /**
   * Get gym analytics
   */
  async getGymAnalytics(gymId: string) {
    const gym = await this.getGymById(gymId);

    const [branchCount, memberCount, activeMembers] = await Promise.all([
      prisma.branches.count({ where: { gym_id: gymId } }),
      prisma.profiles.count({ where: { gym_id: gymId } }),
      prisma.profiles.count({ 
        where: { 
          gym_id: gymId,
          is_active: true
        } 
      })
    ]);

    return {
      gym_name: gym.name,
      subscription_plan: gym.subscription_plan,
      subscription_expires: gym.subscription_end_date,
      branch_count: branchCount,
      max_branches: gym.max_branches,
      member_count: memberCount,
      active_members: activeMembers,
      max_members: gym.max_members,
      capacity_utilization: {
        branches: ((branchCount / gym.max_branches) * 100).toFixed(2) + '%',
        members: ((memberCount / gym.max_members) * 100).toFixed(2) + '%'
      }
    };
  }
}

export const gymService = new GymService();

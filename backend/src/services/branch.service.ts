import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { CreateBranchInput, UpdateBranchInput, BranchQueryInput } from '../validation/branch.validation';

export class BranchService {
  /**
   * Get all branches with filters
   */
  async getBranches(query: BranchQueryInput) {
    const { status, gym_id, search } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (gym_id) {
      where.gym_id = gym_id;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ];
    }

    const branches = await prisma.branches.findMany({
      where,
      include: {
        gyms: {
          select: { name: true, id: true }
        },
        profiles: {
          select: { full_name: true, email: true }
        },
        _count: {
          select: {
            members: true,
            trainer_profiles: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return branches;
  }

  /**
   * Get single branch by ID
   */
  async getBranchById(id: string) {
    const branch = await prisma.branches.findUnique({
      where: { id },
      include: {
        gyms: true,
        profiles: {
          select: { full_name: true, email: true, phone: true }
        },
        _count: {
          select: {
            members: true,
            trainer_profiles: true,
            gym_classes: true
          }
        }
      }
    });

    if (!branch) {
      throw new ApiError('Branch not found', 404);
    }

    return branch;
  }

  /**
   * Create new branch
   */
  async createBranch(data: CreateBranchInput) {
    // Check if branch code already exists
    if (data.code) {
      const existingBranch = await prisma.branches.findFirst({
        where: { code: data.code }
      });

      if (existingBranch) {
        throw new ApiError('Branch with this code already exists', 400);
      }
    }

    const branch = await prisma.branches.create({
      data,
      include: {
        gyms: {
          select: { name: true }
        }
      }
    });

    return branch;
  }

  /**
   * Update branch
   */
  async updateBranch(id: string, data: UpdateBranchInput) {
    await this.getBranchById(id);

    const branch = await prisma.branches.update({
      where: { id },
      data,
      include: {
        gyms: {
          select: { name: true }
        }
      }
    });

    return branch;
  }

  /**
   * Delete branch
   */
  async deleteBranch(id: string) {
    const branch = await this.getBranchById(id);

    // Check if branch has members
    const memberCount = await prisma.members.count({
      where: { branch_id: id }
    });

    if (memberCount > 0) {
      throw new ApiError('Cannot delete branch with active members', 400);
    }

    await prisma.branches.delete({
      where: { id }
    });

    return { message: 'Branch deleted successfully' };
  }

  /**
   * Get branch statistics
   */
  async getBranchStats(branchId: string) {
    const [memberCount, trainerCount, classCount, revenue] = await Promise.all([
      prisma.members.count({ where: { branch_id: branchId, status: 'active' } }),
      prisma.trainer_profiles.count({ where: { branch_id: branchId, is_active: true } }),
      prisma.gym_classes.count({ where: { branch_id: branchId, status: 'scheduled' } }),
      prisma.financial_transactions.aggregate({
        where: { branch_id: branchId, type: 'income' },
        _sum: { amount: true }
      })
    ]);

    return {
      members: memberCount,
      trainers: trainerCount,
      classes: classCount,
      revenue: revenue._sum.amount || 0
    };
  }
}

export const branchService = new BranchService();

import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { CreateMemberInput, UpdateMemberInput, MemberQueryInput } from '../validation/member.validation';

export class MemberService {
  /**
   * Get all members with filters
   */
  async getMembers(query: MemberQueryInput, userRole: string, userBranchId?: string | null) {
    const { branch_id, trainer_id, status, search, page = 1, limit = 50 } = query;

    const where: any = {};

    // Branch filtering based on user role
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      where.branch_id = userBranchId;
    } else if (branch_id) {
      where.branch_id = branch_id;
    }

    if (trainer_id) {
      where.assigned_trainer_id = trainer_id;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [members, total] = await Promise.all([
      prisma.members.findMany({
        where,
        include: {
          branches: {
            select: { name: true, id: true }
          },
          trainer_profiles: {
            select: { name: true, id: true }
          },
          membership_plans: {
            select: { name: true, id: true, price: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.members.count({ where })
    ]);

    return {
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single member by ID
   */
  async getMemberById(id: string, userRole: string, userBranchId?: string | null) {
    const member = await prisma.members.findUnique({
      where: { id },
      include: {
        branches: true,
        trainer_profiles: true,
        membership_plans: true,
        profiles: {
          select: { email: true, full_name: true, phone: true }
        }
      }
    });

    if (!member) {
      throw new ApiError('Member not found', 404);
    }

    // Check branch access
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      if (member.branch_id !== userBranchId) {
        throw new ApiError('Access denied', 403);
      }
    }

    return member;
  }

  /**
   * Create new member
   */
  async createMember(data: CreateMemberInput) {
    // Check if email already exists
    if (data.email) {
      const existingMember = await prisma.members.findFirst({
        where: { email: data.email }
      });

      if (existingMember) {
        throw new ApiError('Member with this email already exists', 400);
      }
    }

    // Verify branch exists
    const branch = await prisma.branches.findUnique({
      where: { id: data.branch_id }
    });

    if (!branch) {
      throw new ApiError('Branch not found', 404);
    }

    // Create member
    const member = await prisma.members.create({
      data: {
        ...data,
        status: 'active',
        joining_date: data.joining_date || new Date().toISOString()
      },
      include: {
        branches: {
          select: { name: true }
        }
      }
    });

    return member;
  }

  /**
   * Update member
   */
  async updateMember(id: string, data: UpdateMemberInput, userRole: string, userBranchId?: string | null) {
    const existingMember = await this.getMemberById(id, userRole, userBranchId);

    const member = await prisma.members.update({
      where: { id },
      data,
      include: {
        branches: {
          select: { name: true }
        },
        trainer_profiles: {
          select: { name: true }
        }
      }
    });

    return member;
  }

  /**
   * Delete member
   */
  async deleteMember(id: string, userRole: string, userBranchId?: string | null) {
    await this.getMemberById(id, userRole, userBranchId);

    await prisma.members.delete({
      where: { id }
    });

    return { message: 'Member deleted successfully' };
  }

  /**
   * Get member statistics
   */
  async getMemberStats(branchId?: string) {
    const where: any = {};
    if (branchId) {
      where.branch_id = branchId;
    }

    const [total, active, inactive, suspended] = await Promise.all([
      prisma.members.count({ where }),
      prisma.members.count({ where: { ...where, status: 'active' } }),
      prisma.members.count({ where: { ...where, status: 'inactive' } }),
      prisma.members.count({ where: { ...where, status: 'suspended' } })
    ]);

    return {
      total,
      active,
      inactive,
      suspended
    };
  }
}

export const memberService = new MemberService();

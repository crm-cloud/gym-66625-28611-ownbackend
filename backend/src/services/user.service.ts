import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { hashPassword } from '../utils/password';
import { CreateUserInput, UpdateUserInput, UserQueryInput, UpdateProfileInput } from '../validation/user.validation';

export class UserService {
  /**
   * Get all users with filters
   */
  async getUsers(query: UserQueryInput, userRole: string, userBranchId?: string | null) {
    const { branch_id, gym_id, role, is_active, search, page = 1, limit = 50 } = query;

    const where: any = {};

    // Branch filtering based on user role
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      where.branch_id = userBranchId;
    } else {
      if (branch_id) where.branch_id = branch_id;
      if (gym_id) where.gym_id = gym_id;
    }

    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active;

    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.profiles.findMany({
        where,
        select: {
          user_id: true,
          email: true,
          full_name: true,
          phone: true,
          role: true,
          avatar_url: true,
          is_active: true,
          email_verified: true,
          branch_id: true,
          gym_id: true,
          created_at: true,
          branches: {
            select: { name: true, id: true }
          },
          gyms: {
            select: { name: true, id: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.profiles.count({ where })
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single user by ID
   */
  async getUserById(id: string, userRole: string, userBranchId?: string | null) {
    const user = await prisma.profiles.findUnique({
      where: { user_id: id },
      select: {
        user_id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        avatar_url: true,
        is_active: true,
        email_verified: true,
        branch_id: true,
        gym_id: true,
        created_at: true,
        updated_at: true,
        branches: true,
        gyms: true
      }
    });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Check branch access
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      if (user.branch_id !== userBranchId) {
        throw new ApiError('Access denied', 403);
      }
    }

    return user;
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserInput, creatorRole: string) {
    // Prevent privilege escalation
    if (creatorRole === 'manager' && (data.role === 'admin' || data.role === 'super_admin')) {
      throw new ApiError('You cannot create admin or super admin users', 403);
    }

    // Check if email already exists
    const existingUser = await prisma.profiles.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ApiError('User with this email already exists', 400);
    }

    // Verify branch exists if provided
    if (data.branch_id) {
      const branch = await prisma.branches.findUnique({
        where: { id: data.branch_id }
      });
      if (!branch) {
        throw new ApiError('Branch not found', 404);
      }
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.profiles.create({
      data: {
        user_id: crypto.randomUUID(),
        email: data.email,
        password_hash: passwordHash,
        full_name: data.full_name,
        phone: data.phone,
        role: data.role,
        branch_id: data.branch_id,
        gym_id: data.gym_id,
        avatar_url: data.avatar_url,
        is_active: data.is_active ?? true,
        email_verified: false
      },
      select: {
        user_id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        branch_id: true,
        gym_id: true,
        branches: {
          select: { name: true }
        }
      }
    });

    return user;
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserInput, userRole: string, userBranchId?: string | null) {
    await this.getUserById(id, userRole, userBranchId);

    const user = await prisma.profiles.update({
      where: { user_id: id },
      data,
      select: {
        user_id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        avatar_url: true,
        is_active: true,
        branch_id: true,
        gym_id: true,
        branches: {
          select: { name: true }
        }
      }
    });

    return user;
  }

  /**
   * Delete user
   */
  async deleteUser(id: string, userRole: string, userBranchId?: string | null) {
    const user = await this.getUserById(id, userRole, userBranchId);

    // Prevent deleting super_admin
    if (user.role === 'super_admin') {
      throw new ApiError('Cannot delete super admin users', 403);
    }

    await prisma.profiles.delete({
      where: { user_id: id }
    });

    return { message: 'User deleted successfully' };
  }

  /**
   * Update own profile (authenticated user)
   */
  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.profiles.update({
      where: { user_id: userId },
      data,
      select: {
        user_id: true,
        email: true,
        full_name: true,
        phone: true,
        avatar_url: true,
        role: true,
        branch_id: true,
        branches: {
          select: { name: true }
        }
      }
    });

    return user;
  }

  /**
   * Get user statistics
   */
  async getUserStats(branchId?: string) {
    const where: any = {};
    if (branchId) {
      where.branch_id = branchId;
    }

    const [total, active, inactive, byRole] = await Promise.all([
      prisma.profiles.count({ where }),
      prisma.profiles.count({ where: { ...where, is_active: true } }),
      prisma.profiles.count({ where: { ...where, is_active: false } }),
      prisma.profiles.groupBy({
        by: ['role'],
        where,
        _count: true
      })
    ]);

    return {
      total,
      active,
      inactive,
      by_role: byRole.map(r => ({
        role: r.role,
        count: r._count
      }))
    };
  }
}

export const userService = new UserService();

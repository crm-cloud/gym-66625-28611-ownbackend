import prisma from '../config/database.js';
import { ApiError } from '../middleware/errorHandler.js';
import { hashPassword } from '../utils/password.js';
import { CreateUserInput, UpdateUserInput, UserQueryInput, UpdateProfileInput } from '../validation/user.validation.js';

export class UserService {
  /**
   * Get all users with filters
   */
  async getUsers(query: UserQueryInput, userRole: string, userBranchId?: string | null) {
    const { branch_id, gym_id, role, is_active, search, page = 1, limit = 50 } = query;

    // Base where clause for profiles
    const where: any = {};
    
    if (is_active !== undefined) where.is_active = is_active;

    // Handle search
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build the base query with role-based filtering
    const baseQuery = prisma.profiles.findMany({
      where,
      select: {
        user_id: true,
        email: true,
        full_name: true,
        phone: true,
        avatar_url: true,
        is_active: true,
        email_verified: true,
        created_at: true,
        user_roles: {
          select: {
            role: true,
            branch_id: true,
            gym_id: true,
            branches: {
              select: { name: true, id: true }
            },
            gyms: {
              select: { name: true, id: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Get total count
    const totalQuery = prisma.profiles.count({ where });

    const [users, total] = await Promise.all([baseQuery, totalQuery]);

    // Process users to handle role-based filtering
    const filteredUsers = users.filter(user => {
      // For non-admin users, filter by their branch
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        return user.user_roles.some(ur => ur.branch_id === userBranchId);
      }
      
      // Apply role filter if specified
      if (role) {
        return user.user_roles.some(ur => ur.role === role);
      }
      
      // Apply branch filter if specified
      if (branch_id) {
        return user.user_roles.some(ur => ur.branch_id === branch_id);
      }
      
      // Apply gym filter if specified
      if (gym_id) {
        return user.user_roles.some(ur => ur.gym_id === gym_id);
      }
      
      return true;
    });

    // Format the response
    const formattedUsers = filteredUsers.map(user => {
      const primaryRole = user.user_roles[0] || {};
      return {
        ...user,
        role: primaryRole.role,
        branch_id: primaryRole.branch_id,
        gym_id: primaryRole.gym_id,
        branches: primaryRole.branches,
        gyms: primaryRole.gyms
      };
    });
    return {
      data: formattedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length, // Use filtered count for accurate pagination
        totalPages: Math.ceil(filteredUsers.length / limit)
      }
    };
  }

  /**
   * Get single user by ID
   */
  async getUserById(id: string, userRole: string, userBranchId?: string | null) {
    const user = await prisma.profiles.findUnique({
      where: { user_id: id },
      include: {
        user_roles: {
          include: {
            branches: true,
            gyms: true
          }
        }
      }
    });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // For non-admin users, ensure they can only access users in their branch
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      const hasAccess = user.user_roles.some(ur => ur.branch_id === userBranchId);
      if (!hasAccess) {
        throw new ApiError('Access denied', 403);
      }
    }

    // Get primary role (first role assignment, or default to member)
    const primaryRole = user.user_roles[0] || { 
      role: 'member' as const, 
      branch_id: null, 
      gym_id: null 
    };

    // Format the response
    const formattedUser = {
      ...user,
      role: primaryRole.role,
      branch_id: primaryRole.branch_id,
      gym_id: primaryRole.gym_id,
      branches: primaryRole.branches,
      gyms: primaryRole.gyms
    };

    return formattedUser;

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

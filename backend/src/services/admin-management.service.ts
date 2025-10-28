import prisma from '../config/database';
import { hashPassword } from '../utils/crypto-utils';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../middleware/errorHandler';

export class AdminManagementService {
  /**
   * Super Admin creates an Admin account with subscription plan
   */
  async createAdmin(data: {
    email: string;
    full_name: string;
    phone?: string;
    subscription_plan_id: string;
    created_by: string; // Super admin ID
  }) {
    // Check if email already exists
    const existingUser = await prisma.profiles.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ApiError('Email already registered', 400);
    }

    // Verify subscription plan exists
    const subscriptionPlan = await prisma.subscription_plans.findUnique({
      where: { id: data.subscription_plan_id }
    });

    if (!subscriptionPlan || !subscriptionPlan.is_active) {
      throw new ApiError('Invalid or inactive subscription plan', 400);
    }

    // Generate temporary password
    const tempPassword = this.generateTempPassword();
    const passwordHash = hashPassword(tempPassword);

    const userId = uuidv4();

    // Create admin user with proper transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create profile (NO role, gym_id, or branch_id)
      const profile = await tx.profiles.create({
        data: {
          user_id: userId,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone,
          password_hash: passwordHash,
          is_active: true,
          email_verified: false, // Admin needs to verify email
        }
      });

      // 2. Create user_roles entry with 'admin' role (NO gym_id or branch_id yet)
      await tx.user_roles.create({
        data: {
          id: uuidv4(),
          user_id: userId,
          role: 'admin',
          // NO gym_id or branch_id - admin creates their own gym
        }
      });

      // 3. Assign subscription plan
      await tx.admin_subscriptions.create({
        data: {
          id: uuidv4(),
          admin_id: userId,
          subscription_plan_id: data.subscription_plan_id,
          assigned_by: data.created_by,
          status: 'active'
        }
      });

      return { profile, tempPassword };
    });

    return {
      admin: {
        user_id: result.profile.user_id,
        email: result.profile.email,
        full_name: result.profile.full_name,
        phone: result.profile.phone,
      },
      tempPassword: result.tempPassword,
      subscriptionPlan: {
        id: subscriptionPlan.id,
        name: subscriptionPlan.name,
        max_branches: subscriptionPlan.max_branches,
        max_members: subscriptionPlan.max_members,
      }
    };
  }

  /**
   * Admin creates their own gym
   */
  async createGym(data: {
    admin_id: string;
    gym_name: string;
  }) {
    // Verify user is an admin
    const userRole = await prisma.user_roles.findFirst({
      where: {
        user_id: data.admin_id,
        role: 'admin'
      },
      include: {
        profiles: {
          include: {
            admin_subscriptions: {
              where: { status: 'active' },
              include: { subscription_plan: true }
            }
          }
        }
      }
    });

    if (!userRole) {
      throw new ApiError('User is not an admin', 403);
    }

    // Check if admin already has a gym
    const existingGym = await prisma.gyms.findFirst({
      where: { owner_id: data.admin_id }
    });

    if (existingGym) {
      throw new ApiError('Admin already has a gym. Each admin can only create one gym.', 400);
    }

    // Get active subscription
    const activeSubscription = userRole.profiles.admin_subscriptions[0];
    if (!activeSubscription) {
      throw new ApiError('No active subscription plan found. Contact super admin.', 403);
    }

    // Create gym
    const gym = await prisma.gyms.create({
      data: {
        id: uuidv4(),
        name: data.gym_name,
        owner_id: data.admin_id,
        subscription_plan_id: activeSubscription.subscription_plan_id,
        status: 'active'
      }
    });

    // Update admin's user_roles to include gym_id
    await prisma.user_roles.updateMany({
      where: {
        user_id: data.admin_id,
        role: 'admin'
      },
      data: {
        gym_id: gym.id
      }
    });

    return {
      gym: {
        id: gym.id,
        name: gym.name,
        owner_id: gym.owner_id,
        status: gym.status,
      },
      subscription: {
        plan_name: activeSubscription.subscription_plan.name,
        max_branches: activeSubscription.subscription_plan.max_branches,
        max_members: activeSubscription.subscription_plan.max_members,
      }
    };
  }

  /**
   * Get admin's subscription details
   */
  async getAdminSubscription(adminId: string) {
    const subscription = await prisma.admin_subscriptions.findFirst({
      where: {
        admin_id: adminId,
        status: 'active'
      },
      include: {
        subscription_plan: true,
        assigner: {
          select: {
            full_name: true,
            email: true
          }
        }
      }
    });

    if (!subscription) {
      throw new ApiError('No active subscription found', 404);
    }

    return subscription;
  }

  /**
   * Generate secure temporary password
   */
  private generateTempPassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '@#$%&*';
    
    const all = uppercase + lowercase + numbers + special;
    let password = '';
    
    // Ensure password meets requirements
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill remaining characters
    for (let i = 4; i < 12; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    
    // Shuffle password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

export const adminManagementService = new AdminManagementService();

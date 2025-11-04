import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../utils/crypto-utils.js';

export interface CreateUserParams {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: string;
  gym_id?: string;
  branch_id?: string;
  date_of_birth?: Date;
  address?: any;
}

export interface CreateUserResult {
  user: any;
  profile: any;
  error?: any;
}

class UserManagementService {
  /**
   * Create user with role
   */
  async createUserWithRole(params: CreateUserParams, requesterRole?: string): Promise<CreateUserResult> {
    const {
      email,
      password,
      full_name,
      phone,
      role,
      gym_id,
      branch_id,
      date_of_birth,
      address
    } = params;

    // RBAC: Super admin can only create admin users
    if (requesterRole === 'super_admin' && role !== 'admin') {
      return {
        user: null,
        profile: null,
        error: new Error('Super admin can only create admin users')
      };
    }

    // RBAC: Admin users cannot be created with gym_id pre-set
    if (role === 'admin' && gym_id) {
      return {
        user: null,
        profile: null,
        error: new Error('Admin users must create their own gym after first login')
      };
    }

    try {
      // Check if user already exists
      const existingProfile = await prisma.profiles.findUnique({
        where: { email }
      });

      if (existingProfile) {
        // User exists, assign role and update profile
        await prisma.user_roles.upsert({
          where: {
            user_id_role: {
              user_id: existingProfile.user_id,
              role
            }
          },
          create: {
            user_id: existingProfile.user_id,
            role
          },
          update: {}
        });

        // Update profile
        const updatedProfile = await prisma.profiles.update({
          where: { user_id: existingProfile.user_id },
          data: {
            phone: phone || existingProfile.phone,
            date_of_birth: date_of_birth || existingProfile.date_of_birth,
            address: address || existingProfile.address,
            is_active: true
          }
        });

        return {
          user: { id: existingProfile.user_id, email },
          profile: updatedProfile,
          error: null
        };
      }

      // Hash password using crypto
      const password_hash = hashPassword(password);

      // Create new profile
      const profile = await prisma.profiles.create({
        data: {
          email,
          password_hash,
          full_name,
          phone,
          date_of_birth,
          address: address || null,
          email_verified: false,
          is_active: true
        }
      });

      // Assign role
      await prisma.user_roles.create({
        data: {
          user_id: profile.user_id,
          role
        }
      });

      return {
        user: { id: profile.user_id, email: profile.email },
        profile,
        error: null
      };
    } catch (error: any) {
      console.error('User creation error:', error);
      return {
        user: null,
        profile: null,
        error
      };
    }
  }

  /**
   * Enable login for existing member
   */
  async enableMemberLogin(
    memberId: string,
    email: string,
    full_name: string,
    password: string,
    branch_id?: string
  ): Promise<CreateUserResult> {
    try {
      // Check if member exists
      const member = await prisma.members.findUnique({
        where: { id: memberId }
      });

      if (!member) {
        return {
          user: null,
          profile: null,
          error: new Error('Member not found')
        };
      }

      // Hash password using crypto
      const password_hash = hashPassword(password);

      // Create profile (without branch_id - branches are assigned via user_roles)
      const profile = await prisma.profiles.create({
        data: {
          email,
          password_hash,
          full_name,
          email_verified: false,
          is_active: true
        }
      });

      // Link member to profile
      await prisma.members.update({
        where: { id: memberId },
        data: { user_id: profile.user_id }
      });

      // Assign member role
      await prisma.user_roles.create({
        data: {
          user_id: profile.user_id,
          role: 'member'
        }
      });

      return {
        user: { id: profile.user_id, email: profile.email },
        profile,
        error: null
      };
    } catch (error: any) {
      console.error('Member login enable error:', error);
      return {
        user: null,
        profile: null,
        error
      };
    }
  }

  /**
   * Generate temporary password
   */
  generateTempPassword(): string {
    return crypto.randomBytes(8).toString('hex');
  }
}

export const userManagementService = new UserManagementService();

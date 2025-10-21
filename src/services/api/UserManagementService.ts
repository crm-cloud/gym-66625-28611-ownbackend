import { api } from '@/lib/axios';
import { UserRole } from '@/types/auth';

export interface CreateUserParams {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  gym_id?: string;
  branch_id?: string;
  date_of_birth?: string;
  address?: string;
  is_active?: boolean;
}

export interface CreateUserResult {
  success: boolean;
  userId?: string;
  error?: string;
}

/**
 * User Management Service
 * Handles user creation and management operations via backend API
 */
class UserManagementServiceClass {
  /**
   * Get all users with filters
   */
  async getUsers(params?: {
    role?: string;
    branch_id?: string;
    is_active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { data } = await api.get('/api/v1/user-management', { params });
    return data.data;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const { data } = await api.get(`/api/v1/user-management/${id}`);
    return data.data;
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const { data } = await api.get('/api/v1/user-management/stats');
    return data.data;
  }

  /**
   * Create a new user account
   */
  async createUser(params: CreateUserParams): Promise<CreateUserResult> {
    try {
      const { data } = await api.post('/api/users', {
        email: params.email,
        password: params.password,
        full_name: params.full_name,
        phone: params.phone,
        role: params.role,
        gym_id: params.gym_id,
        branch_id: params.branch_id,
        date_of_birth: params.date_of_birth,
        address: params.address
      });

      return {
        success: true,
        userId: data.user_id || data.id
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create user'
      };
    }
  }

  /**
   * Enable login for an existing member
   */
  async enableMemberLogin(
    memberId: string,
    email: string,
    full_name: string,
    password: string,
    branch_id?: string
  ): Promise<CreateUserResult> {
    try {
      const { data } = await api.post(`/api/members/${memberId}/enable-login`, {
        email,
        password,
        full_name,
        branch_id
      });

      return {
        success: true,
        userId: data.user_id || data.id
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to enable member login'
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: Partial<CreateUserParams>): Promise<CreateUserResult> {
    try {
      await api.patch(`/api/users/${userId}`, updates);

      return {
        success: true,
        userId
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update user'
      };
    }
  }

  /**
   * Delete user account
   */
  async deleteUser(userId: string): Promise<CreateUserResult> {
    try {
      await api.delete(`/api/users/${userId}`);

      return {
        success: true,
        userId
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete user'
      };
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(userId: string, email: string): Promise<void> {
    await api.post('/api/users/send-welcome-email', {
      user_id: userId,
      email
    });
  }
}

export const UserManagementService = new UserManagementServiceClass();

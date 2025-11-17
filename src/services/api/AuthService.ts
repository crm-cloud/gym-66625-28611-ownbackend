import { api } from '@/lib/axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface AuthResponse {
  user: any;
  access_token: string;
}

/**
 * Auth Service
 * Handles authentication operations
 * Uses backend API for all authentication functionality
 */
class AuthServiceClass {
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const { data: response } = await api.post('/api/auth/signup', {
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      phone: data.phone
    });

    // Automatically log in after registration
    return this.login({
      email: data.email,
      password: data.password
    });
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post('/api/auth/login', credentials);
    
    // Store access token
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
    }
    
    return data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local auth data
      localStorage.removeItem('access_token');
      delete api.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<any> {
    const { data } = await api.get('/api/auth/me');
    return data;
  }

  // Token refresh functionality has been removed
  // Users will need to log in again when their session expires

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/api/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/api/auth/request-password-reset', { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/api/auth/reset-password', {
      token,
      password: newPassword
    });
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    await api.post('/api/auth/verify-email', { token });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const AuthService = new AuthServiceClass();

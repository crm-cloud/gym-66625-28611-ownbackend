import { api } from '@/lib/axios';
import { supabase } from '@/integrations/supabase/client';

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
  refresh_token: string;
}

/**
 * Auth Service
 * Handles authentication operations
 * Uses Supabase Auth for user management and JWT tokens for API access
 */
class AuthServiceClass {
  /**
   * Register new user (uses Supabase Auth)
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { 
          full_name: data.full_name, 
          phone: data.phone 
        }
      }
    });

    if (error) throw error;
    if (!authData.user) throw new Error('User creation failed');

    // Get JWT tokens from backend
    const response = await api.post('/api/auth/login', {
      email: data.email,
      password: data.password
    });

    return response.data;
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post('/api/auth/login', credentials);
    
    // Store tokens
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
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
      // Always clear local tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Sign out from Supabase Auth
      await supabase.auth.signOut();
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<any> {
    const { data } = await api.get('/api/auth/me');
    return data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ access_token: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');

    const { data } = await api.post('/api/auth/refresh', {
      refresh_token: refreshToken
    });

    // Store new access token
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }

    return data;
  }

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

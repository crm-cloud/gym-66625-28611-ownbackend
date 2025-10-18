import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import api from '@/lib/axios';
import { User, AuthState, LoginCredentials, UserRole } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

const AuthContext = createContext<{
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
}>({
  authState: { user: null, isAuthenticated: false, isLoading: true, error: null },
  login: async () => {},
  logout: () => {},
  signUp: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Check if user has valid tokens on mount
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (!accessToken || !refreshToken) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        return;
      }

      try {
        // Verify token and get user profile
        const response = await api.get('/api/users/me');
        const userData = response.data;

        setAuthState({
          user: {
            id: userData.user_id || userData.id,
            email: userData.email,
            name: userData.full_name,
            role: userData.role as UserRole,
            teamRole: userData.team_role,
            avatar: userData.avatar_url,
            phone: userData.phone,
            joinDate: userData.created_at?.split('T')[0],
            branchId: userData.branch_id,
            branchName: userData.branch_name,
            gym_id: userData.gym_id,
            gymName: userData.gym_name
          },
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (error: any) {
        console.error('Token validation failed:', error);
        // Clear invalid tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password
      });

      const { user: userData, access_token, refresh_token } = response.data;

      if (!userData || !access_token || !refresh_token) {
        throw new Error('Invalid response from server');
      }

      // Store tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Map backend user data to frontend User type
      const user: User = {
        id: userData.userId || userData.user_id || userData.id,
        email: userData.email,
        name: userData.fullName || userData.full_name || userData.name,
        role: userData.role as UserRole,
        teamRole: userData.teamRole || userData.team_role,
        avatar: userData.avatarUrl || userData.avatar_url || userData.avatar,
        phone: userData.phone,
        joinDate: userData.createdAt?.split('T')[0] || userData.created_at?.split('T')[0],
        branchId: userData.branchId || userData.branch_id,
        branchName: userData.branchName || userData.branch_name,
        gym_id: userData.gymId || userData.gym_id,
        gymName: userData.gymName || userData.gym_name
      };

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.name}`,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      });
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: any): Promise<void> => {
    try {
      const response = await api.post('/api/auth/signup', {
        email,
        password,
        full_name: userData.full_name || userData.name,
        role: userData.role || 'member',
        ...userData
      });

      toast({
        title: "Account created",
        description: response.data.message || "You can now log in with your credentials.",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Sign up failed';
      
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint to invalidate refresh token
      await api.post('/api/auth/logout', {
        refresh_token: localStorage.getItem('refresh_token')
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Reset auth state
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });

      // Redirect to login
      window.location.href = '/login';
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

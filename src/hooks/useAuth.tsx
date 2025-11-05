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
    // Check if user has a valid session on mount
    const checkSession = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false
        }));
        return;
      }

      try {
        // Set the auth header for subsequent requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Validate token and get user profile
        const response = await api.get('/auth/me');
        // Handle nested data structure in response
        const responseData = response.data.data || response.data;
        const userData = responseData.user || responseData;

        // Map backend user data to frontend User type consistently with login
        const user = {
          id: userData.user_id || userData.id,
          email: userData.email,
          name: userData.full_name || userData.name,
          role: userData.role,
          teamRole: userData.team_role || userData.role, // Fallback to role if team_role not available
          avatar: userData.avatar_url || userData.avatar,
          phone: userData.phone || userData.phone_number,
          joinDate: (userData.created_at || userData.createdAt || new Date().toISOString()).split('T')[0],
          branchId: userData.branch_id || userData.branchId,
          branchName: userData.branch_name || userData.branchName,
          gym_id: userData.gym_id || userData.gymId,
          gymName: userData.gym_name || userData.gymName
        };

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (error: any) {
        console.error('Session validation failed:', error);
        // Clear invalid token
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        delete api.defaults.headers.common['Authorization'];
        
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Your session has expired. Please log in again.'
        });
      }
    };

    checkSession();
  }, []);

  const login = async (credentials) => {
    setAuthState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));
    
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      // Handle nested data structure in response
      const responseData = response.data.data || response.data;
      const { access_token, refresh_token, user: userData } = responseData;
      
      if (!access_token || !userData) {
        throw new Error('Invalid response from server');
      }
      
      // Store JWT tokens
      localStorage.setItem('access_token', access_token);
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
      }
      
      // Set default auth header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Map backend user data to frontend User type
      const user = {
        id: userData.user_id || userData.id,
        email: userData.email,
        name: userData.full_name || userData.name,
        role: userData.role,
        teamRole: userData.team_role || userData.role, // Fallback to role if team_role not available
        avatar: userData.avatar_url || userData.avatar,
        phone: userData.phone || userData.phone_number,
        joinDate: (userData.created_at || new Date().toISOString()).split('T')[0],
        branchId: userData.branch_id,
        branchName: userData.branch_name,
        gym_id: userData.gym_id,
        gymName: userData.gym_name
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
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      }));
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: any): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        full_name: userData.name || userData.full_name,
        phone: userData.phone,
        role: userData.role || 'member',
      });

      const { access_token, refresh_token, user: userResponse } = response.data;

      // Store tokens if provided
      if (access_token) {
        localStorage.setItem('access_token', access_token);
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        setAuthState({
          user: {
            id: userResponse.user_id,
            email: userResponse.email,
            name: userResponse.full_name,
            role: 'member' as UserRole,
            phone: userResponse.phone,
            joinDate: new Date().toISOString().split('T')[0],
          },
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        // Registration successful but needs email verification
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: null
        }));
      }

      toast({
        title: "Account created",
        description: response.data.message || "Registration successful. Please check your email to verify your account.",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Sign up failed';
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
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
      // Call backend logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear tokens and auth header
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      
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

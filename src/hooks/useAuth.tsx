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
      const token = localStorage.getItem('token');

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
        const response = await api.get('/api/auth/me');
        const userData = response.data;

        setAuthState({
          user: {
            id: userData.id,
            email: userData.email,
            name: userData.name || userData.full_name,
            role: userData.role as UserRole,
            teamRole: userData.teamRole || userData.team_role,
            avatar: userData.avatar,
            phone: userData.phone,
            joinDate: userData.createdAt?.split('T')[0] || userData.created_at?.split('T')[0],
            branchId: userData.branchId || userData.branch_id,
            branchName: userData.branchName || userData.branch_name,
            gym_id: userData.gymId || userData.gym_id,
            gymName: userData.gymName || userData.gym_name
          },
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (error: any) {
        console.error('Session validation failed:', error);
        // Clear invalid token
        localStorage.removeItem('token');
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

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });

      const { access_token, refresh_token, user: userData } = response.data;

      if (!access_token || !userData) {
        throw new Error('Invalid response from server');
      }

      // Store JWT token with consistent key
      localStorage.setItem('access_token', access_token);
      
      // Set default auth header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Map backend user data to frontend User type
      const user: User = {
        id: userData.user_id,
        email: userData.email,
        name: userData.full_name,
        role: userData.role as UserRole,
        teamRole: userData.teamRole || userData.team_role,
        avatar: userData.avatar,
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
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await api.post('/api/auth/register', {
        email,
        password,
        name: userData.name || userData.full_name,
        role: userData.role || 'member',
        ...userData
      });

      // After successful registration, log the user in automatically
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        setAuthState({
          user: {
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.name || response.data.user.full_name,
            role: response.data.user.role,
            teamRole: response.data.user.teamRole,
            avatar: response.data.user.avatar,
            phone: response.data.user.phone,
            joinDate: new Date().toISOString().split('T')[0],
            branchId: response.data.user.branchId,
            branchName: response.data.user.branchName,
            gym_id: response.data.user.gymId,
            gymName: response.data.user.gymName
          },
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      }

      toast({
        title: "Account created",
        description: response.data.message || "You have been successfully registered and logged in.",
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
    const token = localStorage.getItem('token');
    
    try {
      // Call backend logout endpoint to invalidate the token
      if (token) {
        await api.post('/api/auth/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear token and auth header
      localStorage.removeItem('token');
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

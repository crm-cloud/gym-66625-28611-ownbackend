import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { AxiosError } from 'axios';
import api from '@/lib/axios';
import { User, AuthState, LoginCredentials, UserRole } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

interface SignUpData {
  name: string;
  phone?: string;
  role?: string;
  full_name?: string;
  phone_number?: string;
  [key: string]: unknown;
}

const AuthContext = createContext<{
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  signUp: (email: string, password: string, userData: SignUpData) => Promise<void>;
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

  const fetchUserData = async (token: string) => {
    try {
      const response = await api.get('/api/auth/me');
      const responseData = response.data.data || response.data;
      const userData = responseData.user || responseData;

      // Normalize role format (convert underscores to hyphens)
      const normalizedRole = (userData.role || '').replace(/_/g, '-');
      
      return {
        id: userData.user_id || userData.id,
        email: userData.email,
        name: userData.full_name || userData.name,
        role: normalizedRole,
        teamRole: (userData.team_role || normalizedRole).replace(/_/g, '-'),
        avatar: userData.avatar_url || userData.avatar,
        phone: userData.phone || userData.phone_number,
        joinDate: (userData.created_at || userData.createdAt || new Date().toISOString()).split('T')[0],
        branchId: userData.branch_id || userData.branchId,
        branchName: userData.branch_name || userData.branchName,
        gym_id: userData.gym_id || userData.gymId,
        gymName: userData.gym_name || userData.gymName
      };
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  };

  // Only run checkSession on initial mount and when not authenticated
  useEffect(() => {
    // Skip if already authenticated to prevent race conditions with login
    if (authState.isAuthenticated) {
      return;
    }

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
        // Set initial auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          // Try to fetch user data with current token
          const user = await fetchUserData(token);
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 401) {
            toast({
              title: 'Session expired',
              description: 'Please sign in again to continue.',
            });
            await logout(false);
            return;
          }
          throw error;
        }
      } catch (error) {
        console.error('Session check failed:', error);
        await logout(false);
      }
    };

    checkSession();
    
    // Set up a listener for storage events to handle logouts from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' && !e.newValue) {
        // If access_token was removed, log out
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'You have been logged out from another tab.'
        });
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [authState.isAuthenticated]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isAuthenticated: false,
      user: null
    }));
    
    try {
      console.log('Attempting login with email:', credentials.email);
      // Use the new API path without version
      const response = await api.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch((error: AxiosError) => {
        console.error('Login API error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data
          }
        });
        throw error;
      });
      
      console.log('Login response received:', response.data);
      
      // Handle nested data structure in response
      const responseData = response.data.data || response.data;
      console.log('[useAuth] Response data extracted:', {
        hasData: !!responseData,
        keys: responseData ? Object.keys(responseData) : [],
        accessTokenExists: !!responseData?.access_token,
        userExists: !!responseData?.user
      });
      
      const { access_token, user: userData } = responseData || {};

      if (!access_token || !userData) {
        console.error('Invalid response format:', responseData);
        throw new Error('Invalid response from server: Missing token or user data');
      }
      
      console.log('[useAuth] ✅ Token and user data extracted:', {
        tokenLength: access_token.length,
        userEmail: userData.email
      });

      // Store JWT token
      localStorage.setItem('access_token', access_token);
      console.log('[useAuth] ✅ Token stored in localStorage:', {
        tokenLength: access_token.length,
        tokenPreview: access_token.substring(0, 30) + '...',
        storedToken: localStorage.getItem('access_token')?.substring(0, 30) + '...'
      });

      // Set default auth header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      console.log('[useAuth] ✅ Authorization header set:', {
        header: api.defaults.headers.common['Authorization']?.substring(0, 30) + '...'
      });
      
      // Normalize role format (convert underscores to hyphens)
      const normalizedRole = (userData.role || 'member').replace(/_/g, '-');
      
      // Map backend user data to frontend User type
      const user: User = {
        id: userData.user_id || userData.id || '',
        email: userData.email || credentials.email,
        name: userData.full_name || userData.name || 'User',
        role: normalizedRole as UserRole,
        teamRole: (userData.team_role || normalizedRole).replace(/_/g, '-'),
        avatar: userData.avatar_url || userData.avatar || '',
        phone: userData.phone || userData.phone_number || '',
        joinDate: (userData.created_at || new Date().toISOString()).split('T')[0],
        branchId: userData.branch_id || '',
        branchName: userData.branch_name || '',
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
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed';
      
      if (error instanceof Error) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage = (axiosError.response.data as any)?.message || 
                        axiosError.response.statusText || 
                        `Server responded with status ${axiosError.response.status}`;
          
          if (axiosError.response.status === 500) {
            errorMessage = 'Internal server error. Please try again later.';
          } else if (axiosError.response.status === 401) {
            errorMessage = 'Invalid email or password';
          }
        } else if (axiosError.request) {
          // The request was made but no response was received
          errorMessage = 'No response from server. Please check your connection.';
        } else {
          // Something happened in setting up the request
          errorMessage = error.message || 'Error setting up login request';
        }
      }
      
      console.error('Login failed:', errorMessage);
      
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

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.post('/api/auth/register', {
        email,
        password,
        full_name: userData.name || userData.full_name,
        phone: userData.phone || userData.phone_number,
        role: userData.role || 'member',
      });

      const responseData = response.data.data || response.data;
      const { access_token, user: userResponse } = responseData;

      if (access_token && userResponse) {
        localStorage.setItem('access_token', access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        const user: User = {
          id: userResponse.user_id || userResponse.id || '',
          email: userResponse.email || email,
          name: userResponse.full_name || userResponse.name || userData.name || 'User',
          role: (userResponse.role || 'member') as UserRole,
          teamRole: (userResponse.team_role || 'member').replace(/_/g, '-'),
          avatar: userResponse.avatar_url || userResponse.avatar || '',
          phone: userResponse.phone || userResponse.phone_number || userData.phone || userData.phone_number || '',
          joinDate: (userResponse.created_at || new Date().toISOString()).split('T')[0],
          branchId: userResponse.branch_id || '',
          branchName: userResponse.branch_name || '',
          gym_id: userResponse.gym_id,
          gymName: userResponse.gym_name
        };
        
        setAuthState({
          user,
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
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? ((error as AxiosError).response?.data as any)?.message || error.message 
        : 'Sign up failed';
      
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

  const logout = async (showToast = true, redirectToLogin = true) => {
    // Clear tokens and auth header first to prevent any race conditions
    localStorage.removeItem('access_token');
    delete api.defaults.headers.common['Authorization'];
    
    // Optimistically update the UI
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        await api.post('/api/auth/logout', undefined, {
          signal: controller.signal
        } as any);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Even if the API call fails, we've already cleared the local state
    }
    
    // Show success message if requested
    if (showToast) {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    }
    
    // Only redirect if specified
    if (redirectToLogin) {
      // Force a hard redirect to ensure all state is cleared
      window.location.href = '/login';
      
      // Force a full page reload after a short delay
      // This ensures any cached data is properly cleared
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

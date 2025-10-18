
import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
    // Listen for auth changes FIRST to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Defer any Supabase calls outside the callback to prevent deadlocks
        setAuthState(prev => ({ ...prev, isAuthenticated: true, isLoading: true, error: null }));
        setTimeout(() => {
          fetchUserProfile(session.user!.id)
            .then((userData) => {
              setAuthState({
                user: userData,
                isAuthenticated: true,
                isLoading: false,
                error: null
              });
            })
            .catch((err) => {
              console.error('Error loading user profile after sign-in:', err);
              setAuthState({
                user: null,
                isAuthenticated: true,
                isLoading: false,
                error: err?.message || 'Failed to load profile'
              });
            });
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    });

    // THEN check for existing session
    (async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          setAuthState(prev => ({ ...prev, isAuthenticated: true, isLoading: true, error: null }));
          // Defer profile fetch to avoid blocking the callback flow
          setTimeout(() => {
            fetchUserProfile(session.user!.id)
              .then((userData) => {
                setAuthState({
                  user: userData,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null
                });
              })
              .catch((err) => {
                console.error('Error loading user profile on init:', err);
                setAuthState({
                  user: null,
                  isAuthenticated: true,
                  isLoading: false,
                  error: err?.message || 'Failed to load profile'
                });
              });
          }, 0);
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      } catch (error: any) {
        console.error('Error getting initial session:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error?.message || 'Failed to get session'
        });
      }
    })();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      // First try to get the user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      // If no profile exists, create one (fallback in case trigger didn't work)
      if (!profile) {
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user) {
          const newProfile = {
            user_id: userId,
            email: authUser.user.email || '',
            full_name: authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0] || 'User',
            role: 'member' as const,
            is_active: true
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select('*')
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            return null;
          }

          return {
            id: createdProfile.user_id,
            email: createdProfile.email,
            name: createdProfile.full_name,
            role: createdProfile.role as UserRole,
            teamRole: createdProfile.team_role,
            avatar: createdProfile.avatar_url,
            phone: createdProfile.phone,
            joinDate: createdProfile.created_at?.split('T')[0],
            branchId: createdProfile.branch_id,
            branchName: undefined
          };
        }
        return null;
      }

      // Get branch info if branch_id exists
      let branchName = undefined;
      if (profile.branch_id) {
        const { data: branch } = await supabase
          .from('branches')
          .select('name')
          .eq('id', profile.branch_id)
          .maybeSingle();
        branchName = branch?.name;
      }

      // Get gym info if gym_id exists
      let gymName = undefined;
      if (profile.gym_id) {
        const { data: gym } = await supabase
          .from('gyms')
          .select('name')
          .eq('id', profile.gym_id)
          .maybeSingle();
        gymName = gym?.name;
      }

      return {
        id: profile.user_id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role as UserRole,
        teamRole: profile.team_role,
        avatar: profile.avatar_url,
        phone: profile.phone,
        joinDate: profile.created_at?.split('T')[0],
        branchId: profile.branch_id,
        branchName: branchName,
        gym_id: profile.gym_id,
        gymName: gymName
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        throw error;
      }

      if (!data?.user) {
        throw new Error('No user data received');
      }

      const userData = await fetchUserProfile(data.user.id);
      
      if (!userData) {
        throw new Error('Failed to load user profile');
      }

      setAuthState({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      
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
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: redirectUrl,
        }
      });

      if (error) throw error;

      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear any existing session data first
      await supabase.auth.signOut({ scope: 'local' });
      
      // Clear any stored tokens or session data
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
      
      // Reset auth state
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });

      // Force a hard refresh to ensure all auth state is cleared
      window.location.href = '/login';
      
      // Show success message (will show after redirect)
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Even if there's an error, we should still clear local state
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      
      // Redirect to login page on error
      window.location.href = '/login';
      
      toast({
        title: "Logged out",
        description: "Your session has been cleared.",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};


export type UserRole = 'super-admin' | 'admin' | 'manager' | 'staff' | 'trainer' | 'team' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  phone?: string;
  joinDate?: string;
  // Multi-tenant fields
  gym_id?: string;
  gymName?: string;
  // Branch-specific fields
  branchId?: string;
  branchName?: string;
  // Team role specialization (for backwards compatibility)
  teamRole?: 'manager' | 'staff' | 'trainer';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

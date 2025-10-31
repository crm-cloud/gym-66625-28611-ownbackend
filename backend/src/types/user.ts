export interface User {
  userId: string;
  user_id: string;
  email: string;
  role: string;
  branchId?: string | null;
  gymId?: string | null;
  fullName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

export interface AuthUser extends User {
  user_id: string;
  role: string;
  email: string;
  branchId?: string | null;
  gymId?: string | null;
  fullName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  permissions?: string[];
}

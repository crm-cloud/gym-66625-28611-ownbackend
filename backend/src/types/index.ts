import { User as PrismaUser } from '@prisma/client';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  branchId?: string | null;
  gymId?: string | null;
  [key: string]: any; // Allow additional properties
}

// Extend Express types
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

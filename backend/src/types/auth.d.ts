import { TokenPayload } from '../utils/jwt';

export {}; // Make this a module
declare global {
  namespace Express {
    // Extend the existing User interface if it exists, or create a new one
    interface User {
      userId: string;
      email: string;
      role: string;
      branchId?: string | null;
      gymId?: string | null;
      // Include all TokenPayload fields
      [key: string]: any;
    }

    // Extend the Request interface to include our user
    interface Request {
      user?: User;
    }
  }
}

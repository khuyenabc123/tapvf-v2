import type { UserRole } from '../users/users.types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        username: string;
        role: UserRole;
        iat?: number;
        exp?: number;
      };
    }
  }
}

export {};

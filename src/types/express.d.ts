import type { UserRole } from '../schemas/authSchema.ts';

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; name: string; email: string; role: UserRole };
    }
  }
}
export {};

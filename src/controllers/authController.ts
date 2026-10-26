import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.ts';
import { getValidated } from '../middleware/validate.ts';
import type { z } from 'zod';
import { registerSchema, loginSchema } from '../schemas/authSchema.ts';

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

export class AuthController {
  constructor(private authService = new AuthService()) {}
  register = async (_req: Request, res: Response, next: NextFunction) => {
    try { const result = await this.authService.register(getValidated<RegisterInput>(res, 'body')); return res.status(201).json({ status: 'success', message: 'Registrasi berhasil', data: result }); }
    catch (error) { next(error); }
  };
  login = async (_req: Request, res: Response, next: NextFunction) => {
    try { const result = await this.authService.login(getValidated<LoginInput>(res, 'body')); return res.status(200).json({ status: 'success', message: 'Login berhasil', data: result }); }
    catch (error) { next(error); }
  };
  me = (req: Request, res: Response) => res.status(200).json({ status: 'success', data: { user: req.user } });
}

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError.ts';
import type { UserRole } from '../schemas/authSchema.ts';

const jwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new AppError(500, 'JWT_SECRET belum dikonfigurasi dengan benar');
  return secret;
};

export function signAccessToken(user: { id: number; name: string; email: string; role: UserRole }) {
  return jwt.sign({ name: user.name, email: user.email, role: user.role }, jwtSecret(), {
    subject: String(user.id), expiresIn: (process.env.JWT_EXPIRES_IN || '2h') as jwt.SignOptions['expiresIn'],
  });
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('Authorization');
  if (!header?.startsWith('Bearer ')) return next(new AppError(401, 'Token autentikasi diperlukan'));
  const token = header.slice(7).trim();
  if (!token) return next(new AppError(401, 'Token autentikasi diperlukan'));
  try {
    const payload = jwt.verify(token, jwtSecret());
    if (typeof payload === 'string' || !payload.sub || typeof payload.name !== 'string' || typeof payload.email !== 'string' || !['admin', 'owner', 'customer'].includes(String(payload.role))) {
      return next(new AppError(401, 'Token tidak valid'));
    }
    const id = Number(payload.sub);
    if (!Number.isInteger(id) || id <= 0) return next(new AppError(401, 'Token tidak valid'));
    req.user = { id, name: payload.name, email: payload.email, role: payload.role as UserRole };
    next();
  } catch {
    next(new AppError(401, 'Token tidak valid atau sudah kedaluwarsa'));
  }
}

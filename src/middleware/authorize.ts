import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.ts';
import { StallRepository } from '../repositories/stallRepository.ts';

export function authorize(...roles: Array<'admin' | 'owner' | 'customer'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, 'Silakan login terlebih dahulu'));
    if (!roles.includes(req.user.role)) return next(new AppError(403, 'Kamu tidak memiliki akses ke endpoint ini'));
    next();
  };
}

export async function authorizeStallOwner(req: Request, _res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(new AppError(401, 'Silakan login terlebih dahulu'));
    if (req.user.role === 'admin') return next();
    const id = Number(req.params.id);
    const stall = await new StallRepository().findById(id);
    if (!stall) return next(new AppError(404, 'Warung tidak ditemukan'));
    if (stall.ownerId !== req.user.id) return next(new AppError(403, 'Kamu hanya dapat mengubah warung milikmu sendiri'));
    next();
  } catch (error) { next(error); }
}

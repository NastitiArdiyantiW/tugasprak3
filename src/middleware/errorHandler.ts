import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.ts';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, 'Endpoint tidak ditemukan'));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Body-parser melempar SyntaxError ketika JSON request tidak valid.
  if (error instanceof SyntaxError && 'status' in error && (error as { status?: number }).status === 400) {
    return res.status(400).json({ status: 'fail', message: 'JSON request tidak valid', errors: [] });
  }
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'fail', message: error.message, errors: error.details ?? [],
    });
  }
  const dbError = error as { number?: number; code?: string } | null;
  if (dbError && (dbError.number === 2627 || dbError.number === 2601)) {
    return res.status(409).json({ status: 'fail', message: 'Data sudah terdaftar', errors: [] });
  }
  if (dbError && (dbError.number === 547)) {
    return res.status(409).json({ status: 'fail', message: 'Data masih digunakan atau tidak memenuhi relasi database', errors: [] });
  }
  console.error(error);
  return res.status(500).json({ status: 'error', message: 'Terjadi kesalahan pada server', errors: [] });
}

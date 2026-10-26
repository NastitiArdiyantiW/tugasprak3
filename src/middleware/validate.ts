import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../errors/AppError.ts';

type Source = 'body' | 'params' | 'query';
export function validate(source: Source, schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }));
      return next(new AppError(400, 'Validasi gagal', errors));
    }
    res.locals.validated ??= {};
    res.locals.validated[source] = result.data;
    next();
  };
}

export function getValidated<T>(res: Response, source: Source): T {
  return res.locals.validated[source] as T;
}

import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'owner', 'customer']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(3, 'name minimal 3 karakter').max(100, 'name maksimal 100 karakter'),
  email: z.string().trim().toLowerCase().email('email harus berformat valid').max(150, 'email maksimal 150 karakter'),
  password: z.string().min(8, 'password minimal 8 karakter').max(72, 'password maksimal 72 karakter'),
}).strict();

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('email harus berformat valid').max(150, 'email maksimal 150 karakter'),
  password: z.string().min(1, 'password wajib diisi'),
}).strict();

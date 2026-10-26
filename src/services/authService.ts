import bcrypt from 'bcryptjs';
import { AppError } from '../errors/AppError.ts';
import { UserRepository } from '../repositories/userRepository.ts';
import { signAccessToken } from '../middleware/authenticate.ts';
import type { UserRole } from '../schemas/authSchema.ts';

export class AuthService {
  constructor(private users = new UserRepository()) {}

  async register(input: { name: string; email: string; password: string }) {
    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new AppError(409, 'Email sudah terdaftar');
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const passwordHash = await bcrypt.hash(input.password, rounds);
    // Role saat registrasi selalu customer. Client tidak dapat memilih role.
    const row = await this.users.create({ name: input.name, email: input.email, passwordHash, role: 'customer' });
    return { user: this.publicUser(row), token: signAccessToken({ id: row.id, name: row.name, email: row.email, role: row.role as UserRole }) };
  }

  async login(input: { email: string; password: string }) {
    const user = await this.users.findByEmail(input.email);
    // Pesan yang sama untuk email yang tidak terdaftar dan password salah.
    const matches = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
    if (!user || !matches) throw new AppError(401, 'Email atau password salah');
    return { user: this.publicUser(user), token: signAccessToken({ id: user.id, name: user.name, email: user.email, role: user.role as UserRole }) };
  }

  private publicUser(user: { id: number; name: string; email: string; role: string; createdAt: Date | null }) {
    return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  }
}

import 'dotenv/config';
import mssql from 'mssql';
import bcrypt from 'bcryptjs';

async function main() {
  const pool = await mssql.connect({
    server: process.env.DB_SERVER || 'localhost',
    port: Number(process.env.DB_PORT || 1433),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME || 'review_kantin',
    options: { encrypt: process.env.DB_ENCRYPT === 'true', trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' },
  });
  try {
    const passwordHash = await bcrypt.hash('rahasia123', Number(process.env.BCRYPT_SALT_ROUNDS || 10));
    const accounts = [
      { email: 'admin@kantin.test', role: 'admin' },
      { email: 'tini@kantin.test', role: 'owner' },
      { email: 'bagas@student.test', role: 'customer' },
    ];
    for (const account of accounts) {
      const result = await pool.request().input('email', mssql.NVarChar(150), account.email).input('passwordHash', mssql.NVarChar(255), passwordHash).query('UPDATE dbo.USERS SET password_hash = @passwordHash WHERE email = @email');
      console.log(`${account.email}: ${result.rowsAffected[0] ? 'password uji diperbarui' : 'email tidak ditemukan, dilewati'}`);
    }
    console.log('Password untuk akun uji yang ditemukan: rahasia123');
  } finally { await pool.close(); }
}
main().catch((error) => { console.error('Gagal menyiapkan akun uji. Periksa koneksi database dan file .env.'); console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });

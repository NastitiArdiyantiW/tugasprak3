# Tugas 3 Praktikum RSI - Review Kantin API

Proyek ini melanjutkan Tugas 2. Stack utama tetap TypeScript, Express.js, Drizzle ORM, dan Microsoft SQL Server. Tambahan Tugas 3: validasi Zod, format error terpusat, autentikasi JWT, hashing password bcrypt, otorisasi role, dan Swagger UI.

## 1. Persiapan

1. Pastikan SQL Server dan database `review_kantin` yang dipakai Tugas 2 masih tersedia.
2. Buka folder proyek ini di VS Code.
3. Jalankan `npm install`.
4. Salin `.env.example` menjadi `.env`, lalu isi `DB_SERVER`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` sesuai konfigurasi SQL Server milikmu.
5. Ubah `JWT_SECRET` menjadi string acak minimal 32 karakter. Jangan unggah `.env` ke GitHub.
6. Pastikan tabel Tugas 2 sudah ada. Jika belum, jalankan `db/02-schema.sql` dan `db/03-seed-full.sql` sesuai petunjuk tugas sebelumnya. Jangan jalankan pembuatan ulang tabel jika database yang dipakai sudah terisi dan berfungsi.

## 2. Menyiapkan akun uji

Data awal Tugas 2 mungkin memakai teks placeholder seperti `hash_admin`, sehingga tidak bisa dipakai sebagai bcrypt hash. Setelah `.env` dan koneksi database benar, jalankan:

```bash
npm run seed:test-accounts
```

Skrip hanya memperbarui password untuk email yang sudah ada. Akun uji yang disiapkan: `admin@kantin.test`, `tini@kantin.test`, dan `bagas@student.test`, dengan password `rahasia123`. Skrip ini tidak membuat akun baru dan tidak menghapus data.

Jika salah satu email tidak ada di database, skrip akan melewatinya. Akun owner lain dapat didaftarkan melalui endpoint register, tetapi role register selalu `customer`; ubah role melalui SQL Server hanya untuk akun uji lokal jika memang diperlukan.

## 3. Menjalankan server

```bash
npm run dev
```

Buka `http://localhost:3000/health` untuk memeriksa koneksi database dan `http://localhost:3000/docs` untuk Swagger UI. Script `predev` akan membuat file dokumentasi Swagger sebelum server dijalankan.

## 4. Endpoint utama Tugas 3

| Method | Endpoint | Akses |
|---|---|---|
| GET | `/api/v1/stalls` | Publik |
| GET | `/api/v1/stalls/:id` | Publik |
| POST | `/api/v1/auth/register` | Publik |
| POST | `/api/v1/auth/login` | Publik |
| GET | `/api/v1/auth/me` | Login semua role |
| POST | `/api/v1/stalls` | Owner, admin |
| PUT | `/api/v1/stalls/:id` | Owner untuk warung sendiri, admin semua warung |
| DELETE | `/api/v1/stalls/:id` | Admin |
| POST | `/api/v1/stalls/:id/reviews` | Login semua role |

Endpoint pengelolaan users, menu-items, reviews lama, likes, flags, dan audit-logs dibatasi untuk admin. Endpoint POST review lama `/api/v1/reviews` tidak digunakan lagi karena `stallId` dan `userId` harus berasal dari path dan token, bukan body.

## 5. Aturan validasi dan error

- Semua input utama divalidasi memakai Zod. String tertentu di-trim, email diubah ke lowercase, dan field tambahan yang tidak dikenal ditolak.
- Error validasi memakai HTTP 400 dan format `status`, `message`, serta `errors` berisi `field` dan `message`.
- Token tidak ada/tidak valid/kedaluwarsa menghasilkan 401.
- Sudah login tetapi role atau kepemilikan tidak sesuai menghasilkan 403.
- Data tidak ditemukan menghasilkan 404. Konflik data unik menghasilkan 409. Kesalahan tak terduga menghasilkan 500 tanpa membocorkan stack trace kepada client.
- Password disimpan sebagai hash bcrypt, bukan teks biasa. Role dari request register tidak diterima; role baru selalu `customer`.

## 6. Cara mengirim token

Login terlebih dahulu. Salin nilai `data.token` dari response, lalu masukkan ke header request terlindungi:

```http
Authorization: Bearer TOKEN_HASIL_LOGIN
```

Di Swagger, klik **Authorize** jika tombol tersebut muncul, lalu masukkan token. Jika tombol tidak muncul, request masih dapat diuji dengan endpoint lain seperti curl atau REST Client menggunakan header tersebut.

## 7. Skenario pengujian yang perlu discreenshot

1. Validasi gagal: `POST /api/v1/auth/register` dengan nama `Ab` atau password `123`.
2. Format error JSON terlihat, dengan `status: fail`, `message: Validasi gagal`, dan array `errors`.
3. Register akun baru dengan name, email, dan password valid; response tidak boleh memuat `passwordHash`.
4. Login akun yang sudah terdaftar dan tunjukkan token pada response.
5. Akses `GET /api/v1/auth/me` dengan token.
6. Request tanpa token ke `POST /api/v1/stalls` harus menghasilkan 401.
7. Login sebagai owner `tini@kantin.test`, lalu `PUT /api/v1/stalls/3` (warung milik user lain) harus menghasilkan 403. Pastikan ID 3 bukan milik owner uji tersebut.
8. Login sebagai customer, lalu `POST /api/v1/stalls` harus menghasilkan 403.
9. Login sebagai admin lalu `DELETE /api/v1/stalls/:id` pada warung uji yang aman, atau jangan jalankan penghapusan data penting.
10. Verifikasi `password_hash` di tabel `USERS` tampak sebagai hash bcrypt yang diawali `$2a$` atau `$2b$`, bukan password biasa.

## 8. Pemeriksaan TypeScript

```bash
npm run typecheck
```

Jika perintah tersebut melaporkan error yang sudah ada pada dependensi/versi Drizzle dari instalasi sebelumnya, periksa pesan error satu per satu. Koneksi SQL Server dan endpoint tetap harus diuji di laptop karena bergantung pada konfigurasi lokal.

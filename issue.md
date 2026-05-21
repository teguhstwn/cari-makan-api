# Implementasi Management User (Tabel dan Endpoint Registrasi & Login)

## Deskripsi
Tugas ini bertujuan untuk menambahkan fungsionalitas manajemen pengguna (User Management) ke dalam aplikasi. Ini termasuk pembuatan tabel `users` di database menggunakan Prisma, registrasi pengguna baru, enkripsi kata sandi (menggunakan `bcrypt`), login pengguna untuk mendapatkan JSON Web Token (JWT), serta middleware autentikasi untuk membatasi akses pada endpoint tertentu.

## Tahapan Implementasi

Berikut adalah langkah-langkah detail yang harus Anda kerjakan secara berurutan:

### 1. Instalasi Dependency Baru
Anda memerlukan pustaka pihak ketiga untuk enkripsi kata sandi dan pembuatan token JWT. Jalankan perintah berikut di terminal:
- `npm install bcrypt jsonwebtoken`
- `npm install --save-dev @types/bcrypt @types/jsonwebtoken`

### 2. Update Skema Database (`prisma/schema.prisma`)
- Buka file `prisma/schema.prisma`.
- Tambahkan model baru bernama `User` yang akan dipetakan ke tabel `users`.
- Buat kolom-kolom berikut pada model `User`:
  - `id`: String (Primary Key, default: `uuid()`, tipe `@db.VarChar(100)`)
  - `username`: String (Unique, tipe `@db.VarChar(50)`)
  - `email`: String (Unique, tipe `@db.VarChar(100)`)
  - `password`: String (Tipe `@db.VarChar(255)`)
  - `nama_lengkap`: String (Opsional, tipe `@db.VarChar(150)`)
  - `createdAt`: DateTime (default: `now()`)
  - Hubungkan model `User` dengan `Favorite` (relasi One-to-Many): `favorites Favorite[]`
- Update model `Favorite` di skema agar memiliki relasi formal ke `User` menggunakan kolom `user_id`:
  - `user User @relation(fields: [user_id], references: [id], onDelete: Cascade)`
- Jalankan perintah sinkronisasi database:
  - `npx prisma format`
  - `npx prisma db push`
  - `npx prisma generate`

### 3. Pembuatan Middleware Autentikasi (`src/middlewares/authMiddleware.ts`)
- Buat folder `src/middlewares/` jika belum ada.
- Buat file baru bernama `authMiddleware.ts`.
- Buat fungsi middleware `authenticateToken` untuk memverifikasi JWT token:
  1. Ambil header `Authorization`. Format token biasanya `Bearer <token>`.
  2. Jika header tidak ada atau formatnya salah, kembalikan response 401 Unauthorized.
  3. Verifikasi token menggunakan `jwt.verify` dengan secret key yang diambil dari `process.env.JWT_SECRET` (tambahkan `JWT_SECRET=rahasia_cari_makan` di file `.env`).
  4. Jika token tidak valid atau kedaluwarsa, kembalikan response 403 Forbidden.
  5. Jika valid, simpan payload user (misal `id` dan `username`) ke dalam objek request (`req.user`) dan panggil `next()`.

*Catatan untuk TypeScript*: Anda mungkin perlu melakukan extend tipe `Request` Express untuk menambahkan properti `user`. Anda bisa mendefinisikannya secara inline atau menggunakan deklarasi file `.d.ts`. Contoh inline:
```typescript
import type { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}
```

### 4. Pembuatan Controller (`src/controllers/userController.ts`)
- Buat file baru bernama `userController.ts` di dalam folder `src/controllers/`.
- Implementasikan fungsi-fungsi berikut:

#### A. `registerUser` (Registrasi)
1. Ambil `username`, `email`, `password`, dan `nama_lengkap` dari `req.body`.
2. Validasi input: pastikan `username`, `email`, dan `password` terisi. Jika tidak, kembalikan response 400 Bad Request.
3. Cek apakah `username` atau `email` sudah terdaftar di database menggunakan `prisma.user.findFirst()`. Jika ada yang sama, kembalikan response 400 Bad Request (misal: "Username/Email sudah digunakan").
4. Enkripsi (hash) `password` menggunakan `bcrypt.hash(password, 10)`.
5. Simpan data user baru ke database menggunakan `prisma.user.create()`.
6. Kembalikan response sukses standar (Status 201) dengan mengirim data user yang berhasil didaftarkan (Kecuali kata sandi/password untuk alasan keamanan).

#### B. `loginUser` (Login)
1. Ambil `email` (atau `username`) dan `password` dari `req.body`.
2. Cari user di database berdasarkan `email` atau `username` yang dikirim. Jika tidak ditemukan, kembalikan response 401 Unauthorized (pesan: "Email/Username atau password salah").
3. Verifikasi password dengan membandingkan password dari body dengan password terenkripsi di database menggunakan `bcrypt.compare(password, user.password)`. Jika salah, kembalikan response 401 Unauthorized.
4. Buat JWT Token menggunakan `jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' })`.
5. Kembalikan response sukses (Status 200) dengan mengirimkan data token beserta detail user.

#### C. `getUserProfile` (Mendapatkan Profil User Terautentikasi)
1. Ambil `user.id` dari `req.user` yang di-inject oleh `authMiddleware`.
2. Cari detail data user di database menggunakan `prisma.user.findUnique()`.
3. Kembalikan data user tersebut (tanpa password) dengan response sukses (Status 200).

### 5. Pembuatan Router (`src/routes/userRoutes.ts`)
- Buat file baru bernama `userRoutes.ts` di dalam folder `src/routes/`.
- Setup express router dan daftarkan endpoint-endpoint berikut:
  - `POST /register` -> memanggil `registerUser`
  - `POST /login` -> memanggil `loginUser`
  - `GET /profile` -> memanggil middleware `authenticateToken` lalu `getUserProfile`
- Ekspor router secara default.

### 6. Pendaftaran Router di Entry Point (`src/index.ts`)
- Buka file `src/index.ts`.
- Lakukan import router baru tersebut: `import userRoutes from './routes/userRoutes.js';`
- Daftarkan pada aplikasi express dengan path URL `/api/users`, contoh kodenya: `app.use('/api/users', userRoutes);`.

### 7. Standar Format Response JSON
Pastikan semua hasil respons mematuhi format JSON standar sukses dan error yang konsisten dengan API lainnya.

**Contoh Response Sukses Registrasi (Status 201):**
```json
{
  "status": "success",
  "message": "User berhasil terdaftar",
  "data": {
    "id": "uuid-string-xxxx-xxxx",
    "username": "teguh_stwn",
    "email": "teguh@example.com",
    "nama_lengkap": "Teguh Setiawan",
    "createdAt": "2026-05-21T08:00:00.000Z"
  }
}
```

**Contoh Response Sukses Login (Status 200):**
```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-string-xxxx-xxxx",
      "username": "teguh_stwn",
      "email": "teguh@example.com"
    }
  }
}
```

---
## Kriteria Kelulusan (Selesai):
Tugas ini dianggap berhasil jika:
1. Tidak ada error saat kompilasi TypeScript dan skema database berhasil di-push.
2. Endpoint `POST /api/users/register` berhasil membuat user baru dengan password terenkripsi (bukan teks polos) di database PostgreSQL.
3. Endpoint `POST /api/users/login` mengembalikan token JWT yang valid saat kredensial benar, dan memberikan error 401 saat salah.
4. Endpoint `GET /api/users/profile` hanya dapat diakses apabila menyertakan header `Authorization: Bearer <token_jwt_yang_valid>` dan mengembalikan informasi user yang tepat.

# Setup Project Node.js Backend (TypeScript)

## Deskripsi
Task ini bertujuan untuk melakukan inisialisasi awal project backend menggunakan lingkungan Node.js dengan **TypeScript**, beserta instalasi dependensi utamanya.

## Langkah-langkah Implementasi

1. **Inisialisasi Project Node.js & TypeScript**
   - Buat dan inisialisasi project Node.js baru (hasilkan file `package.json` dengan perintah seperti `npm init -y`).
   - Lakukan inisialisasi TypeScript (hasilkan file `tsconfig.json` dengan perintah `npx tsc --init`).

2. **Instalasi Dependensi Utama (Production)**
   Tambahkan library berikut ke dalam project:
   - `express`: Sebagai framework utama backend.
   - `cors`: Untuk menangani Cross-Origin Resource Sharing.
   - `dotenv`: Untuk memuat variabel environment.
   - `axios`: Untuk melakukan HTTP request ke eksternal jika dibutuhkan.
   - `redis`: Untuk implementasi caching/in-memory storage.
   - `@prisma/client`: Untuk ORM (Object-Relational Mapping) dan integrasi database.

3. **Instalasi Dependensi Development (DevDependencies)**
   Install package berikut khusus untuk environment pengembangan:
   - `typescript`: Compiler TypeScript utama.
   - `tsx` atau `ts-node-dev`: Runner untuk mengeksekusi TypeScript langsung dengan fitur *hot-reload*.
   - `@types/node`, `@types/express`, `@types/cors`: Definisi *type* untuk library terkait.
   - `prisma`: Prisma CLI untuk mengurus migrasi dan generate client database.

4. **Inisialisasi Konfigurasi Bawaan**
   - Jalankan inisialisasi Prisma (`npx prisma init`) agar struktur file konfigurasi dasar (`schema.prisma` dan `.env`) terbentuk secara otomatis.
   - Siapkan file entry point aplikasi dengan ekstensi TypeScript (misalnya `src/index.ts` atau `src/app.ts`).
   - Tambahkan command standar pada bagian `scripts` di `package.json` (contoh: `"dev": "tsx watch src/index.ts"`, `"build": "tsc"`).

*Catatan:* Implementasikan struktur folder (seperti `src/controllers`, `src/routes`, `src/services`, dsb.) dengan standar clean architecture atau MVC sesuai kebutuhan, instruksi ini hanya berfokus pada tahapan persiapan *environment*.

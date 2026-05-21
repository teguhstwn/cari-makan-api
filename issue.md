# Implementasi Endpoint Bookmark/Favorite Merchant

## Deskripsi
Tugas ini bertujuan untuk menambahkan fungsionalitas di mana pengguna dapat menyimpan atau menandai (bookmark/favorite) merchant (tempat makan) tertentu. Data favorit ini harus tersimpan di dalam database menggunakan Prisma ORM.

## Tahapan Implementasi

Berikut adalah langkah-langkah detail yang harus Anda kerjakan secara berurutan:

### 1. Update Skema Database (`prisma/schema.prisma`)
- Buka file `prisma/schema.prisma`.
- Tambahkan model baru bernama `Favorite` (atau `Bookmark`).
- Buat kolom-kolom berikut pada model `Favorite`:
  - `id`: Int (Primary Key, autoincrement)
  - `user_id`: String (Untuk menyimpan identitas pengguna. Gunakan tipe String untuk simulasi jika sistem autentikasi belum ada sepenuhnya).
  - `merchant_id`: Int (Foreign key yang berelasi dengan model `Merchant`).
  - `createdAt`: DateTime (default: now()).
- Definisikan relasi antara `Favorite` dan `Merchant`. Pastikan model `Merchant` ditambahkan relasi `favorites Favorite[]`.
- Setelah file disave, buka terminal dan jalankan perintah berikut untuk mensinkronisasi dan men-generate client:
  - `npx prisma format` (untuk merapikan kode skema)
  - `npx prisma db push` (untuk menerapkan struktur tabel baru ke database)
  - `npx prisma generate` (untuk memperbarui Prisma Client)

### 2. Pembuatan Controller (`src/controllers/favoriteController.ts`)
- Buat file baru bernama `favoriteController.ts` di dalam folder `src/controllers/`.
- Import `PrismaClient` untuk berinteraksi dengan database (jika sudah ada instance prisma yang diexport dari file util, gunakan itu. Jika belum, buat dan gunakan `import { PrismaClient } from '@prisma/client'`).
- Buat fungsi *asynchronous* baru bernama `addFavorite` untuk menangani endpoint (request POST).
- **Alur Logika Fungsi `addFavorite`**:
  1. Ambil data dari `req.body`. Anda memerlukan data: `google_place_id`, `nama_merchant`, `alamat`, dan `user_id`.
  2. Lakukan pengecekan atau *upsert* data ke tabel `Merchant`:
     Gunakan fungsi `prisma.merchant.upsert()` berdasarkan `google_place_id`. Jika merchant tersebut sudah ada, gunakan datanya. Jika belum, simpan data merchant baru tersebut. Ambil `id` merchant hasil operasi ini.
  3. Simpan relasi ke tabel `Favorite` menggunakan `prisma.favorite.create()`, dengan menyisipkan `user_id` dari body request dan `merchant_id` yang didapat dari langkah ke-2.
  4. Kembalikan response sukses standar (Status 201) dengan data yang berhasil disimpan.
  5. Bungkus semua kode tersebut dengan blok `try...catch`. Jika terjadi error, kembalikan response error (Status 500).

### 3. Pembuatan Router (`src/routes/favoriteRoutes.ts`)
- Buat file baru bernama `favoriteRoutes.ts` di dalam folder `src/routes/`.
- Setup express router: `import { Router } from 'express'; const router = Router();`
- Import fungsi `addFavorite` dari `favoriteController.ts` (pastikan ekstensi import sesuai, misal `.js` jika menggunakan konfigurasi ES Module).
- Daftarkan endpoint POST untuk root path: `router.post('/', addFavorite);`
- Lakukan export default dari router tersebut.

### 4. Pendaftaran Router di Entry Point (`src/index.ts`)
- Buka file `src/index.ts`.
- Import router baru tersebut, misalnya `import favoriteRoutes from './routes/favoriteRoutes.js';`.
- Daftarkan router pada aplikasi express dengan path URL `/api/favorites`, contoh kodenya: `app.use('/api/favorites', favoriteRoutes);`.

### 5. Standar Format Response JSON
Pastikan hasil kembalian (response) mematuhi format JSON standar saat sukses disimpan:

**Contoh Response Sukses (Status 201):**
```json
{
  "status": "success",
  "message": "Berhasil menyimpan merchant ke daftar favorit",
  "data": {
    "id": 1,
    "user_id": "user-12345",
    "merchant_id": 5,
    "createdAt": "2023-11-01T10:00:00.000Z"
  }
}
```

---
**Kriteria Kelulusan (Selesai):**
Tugas ini dianggap berhasil jika:
1. Tidak ada error saat kompilasi TypeScript dan skema Prisma berhasil tersinkronisasi.
2. Ketika mengakses `POST /api/favorites` dengan payload JSON (`user_id`, data merchant), server memberikan respons 201 Created.
3. Data secara otomatis tersimpan ke tabel `merchants` (jika data unik/baru) dan ke tabel `favorites` di PostgreSQL.
4. Format response mematuhi contoh JSON di atas.

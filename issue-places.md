# Perencanaan Tugas (Task Planning): Implementasi Autentikasi JWT pada Endpoints

## Deskripsi Tugas
Tugas ini bertujuan untuk mengamankan beberapa endpoint API agar hanya dapat diakses oleh pengguna yang sudah login (terautentikasi). Kita akan mengimplementasikan middleware `Authorization Bearer {{jwt_token}}` pada 5 endpoint berikut:

1. `GET /api/places/recommendations`
2. `GET /api/places/nearby`
3. `GET /api/places/search`
4. `GET /api/places/:id` (Get Place Details)
5. `GET /api/favorites` (Get Favorites)

---

## Tahapan Implementasi

Untuk junior programmer atau AI model yang akan mengimplementasikan tugas ini, silakan ikuti langkah-langkah terstruktur berikut:

### Langkah 1: Persiapan Middleware
1. Pastikan file middleware autentikasi sudah ada. Cek file `src/middlewares/authMiddleware.ts`.
2. Middleware ini (biasanya bernama `authenticateToken`) berfungsi untuk mengekstrak token dari header `Authorization: Bearer <token>`, memverifikasinya, dan memasukkan data user ke dalam `request`.

### Langkah 2: Update Endpoint Places
Buka file router untuk places, yaitu `src/routes/placeRoutes.ts`.
1. **Import Middleware:** Tambahkan import untuk middleware autentikasi di bagian atas file.
   ```typescript
   import { authenticateToken } from '../middlewares/authMiddleware.js';
   ```
2. **Terapkan Middleware pada Routes:** Modifikasi rute-rute yang ada agar menggunakan middleware `authenticateToken` sebelum fungsi controller-nya. Ubah rute-rute berikut:
   - `router.get('/recommendations', authenticateToken, getRecommendedPlaces);`
   - `router.get('/nearby', authenticateToken, getNearbyPlaces);`
   - `router.get('/search', authenticateToken, searchPlaces);`
   - `router.get('/:id', authenticateToken, getPlaceDetails);`

### Langkah 3: Verifikasi Endpoint Favorites
Buka file router untuk favorites, yaitu `src/routes/favoriteRoutes.ts`.
1. Pastikan middleware `authenticateToken` sudah di-import.
2. Pastikan rute `GET /` (Get Favorites) sudah menggunakan middleware tersebut.
   ```typescript
   router.get('/', authenticateToken, getFavorites);
   ```
   *(Catatan: Rute ini mungkin sudah mengimplementasikan middleware tersebut, tugas Anda adalah memastikan dan memverifikasinya.)*

### Langkah 4: Pengujian (Testing)
1. Jalankan server lokal (`npm run dev` atau `npm.cmd run dev`).
2. Gunakan Postman, Insomnia, atau aplikasi klien API lainnya.
3. **Skenario Gagal (401/403):** Panggil endpoint tanpa menyertakan header `Authorization`, pastikan API menolak akses dengan status 401 Unauthorized atau 403 Forbidden.
4. **Skenario Berhasil (200):**
   - Panggil endpoint Login terlebih dahulu untuk mendapatkan JWT Token.
   - Panggil endpoint tujuan (contoh: `/api/places/recommendations`) dengan menyertakan header:
     `Authorization: Bearer <token_jwt_anda>`
   - Pastikan API memberikan response data yang benar dengan status HTTP 200 OK.

## Catatan Penting
- Karena project ini menggunakan mode ES Modules (`"type": "module"` pada `package.json`), perhatikan penulisan ekstensi saat melakukan import file lokal. Gunakan ekstensi `.js` pada *import path* (misal: `../middlewares/authMiddleware.js`).

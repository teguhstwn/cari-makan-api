# Perencanaan Tugas (Task Planning): Endpoint Place Details

## Deskripsi Tugas
Membuat endpoint API baru untuk mendapatkan detail lengkap dari sebuah tempat (Place Details) berdasarkan `id` tempat (Place ID) tersebut.

## Spesifikasi Endpoint
- **Method:** `GET`
- **Path Parameter:** `id` (Place ID dari tempat yang dicari)
- **Contoh URL:** `/api/places/:id` (Sesuaikan dengan *base path* aplikasi)

## ⚠️ PERHATIAN SANGAT PENTING (CRITICAL WARNING) ⚠️
Mengenai integrasi dengan Google Maps API:
Google membagi harga data Place Details ke dalam beberapa kategori (Basic, Contact, Atmosphere). **Jangan pernah menembak API Place Details tanpa parameter `fields`!**
Jika Anda tidak menentukan `fields`, Google akan mengembalikan semua data yang tersedia dan **menagih tarif maksimal** untuk *request* tersebut, padahal kita mungkin hanya butuh sebagian kecil datanya. Selalu tentukan spesifik *fields* apa saja yang dibutuhkan aplikasi.

---

## Tahapan Implementasi

Untuk *junior programmer* atau *AI model* yang akan mengimplementasikan tugas ini, silakan ikuti langkah-langkah terstruktur berikut:

### Langkah 1: Definisikan Field yang Dibutuhkan
1. Analisa kebutuhan data (misal: nama, alamat, rating, lokasi kordinat).
2. Buat daftar array atau *string* *fields* yang akan di-*request* ke Google API. 
   - *Contoh: `const PLACE_FIELDS = 'id,displayName,formattedAddress,location,rating';`*

### Langkah 2: Buat Logika Service (Google Maps API Call)
1. Buka file yang menangani panggilan ke eksternal API Google (contoh: `src/services/googleService.ts` atau semacamnya).
2. Buat fungsi baru, misalnya `fetchPlaceDetails(placeId)`.
3. Dalam fungsi ini, panggil Google Place Details API. 
4. **WAJIB:** Sisipkan variabel `fields` yang sudah didefinisikan pada Langkah 1 sebagai *query parameter* ke dalam URL request. (misal: `?fields=id,displayName...`).

### Langkah 3: Buat Controller
1. Buka file controller untuk entitas Places (contoh: `src/controllers/placeController.ts`).
2. Buat fungsi controller baru, misalnya `getPlaceDetailsById(req, res)`.
3. Ambil `id` dari `req.params`.
4. Lakukan validasi sederhana: pastikan `id` tidak kosong/undefined. Jika kosong, return HTTP 400 (Bad Request).
5. Panggil fungsi *service* `fetchPlaceDetails(placeId)` yang dibuat pada Langkah 2 di dalam blok `try...catch`.
6. Format data balikan dari service tersebut dan kirimkan ke klien menggunakan format JSON (HTTP 200).
7. Jika terjadi *error* pada blok `catch`, *return* respons error dengan status HTTP 500 (Internal Server Error) atau status lain yang relevan.

### Langkah 4: Daftarkan Route Baru
1. Buka file *router* (contoh: `src/routes/placeRoutes.ts`).
2. Tambahkan rute baru menggunakan method GET:
   - `router.get('/:id', getPlaceDetailsById);`
3. Pastikan penempatan rute ini tepat (biasanya ditempatkan dengan benar agar tidak berbenturan dengan rute statis lain jika ada).

### Langkah 5: Pengujian (Testing)
1. Jalankan *server backend* (seperti `npm run dev`).
2. Gunakan *tools* seperti Postman, Insomnia, atau cURL untuk menembak *endpoint*: `GET http://localhost:PORT/.../places/<place_id_valid>`.
3. Validasi *response*: pastikan struktur data sesuai yang diharapkan dan hanya mengembalikan *fields* yang diminta.
4. (Opsional tapi disarankan) Tambahkan *unit/integration test* sederhana untuk rute ini.

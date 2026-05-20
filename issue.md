# Implementasi Endpoint Integrasi Google Places API

## Deskripsi
Tugas ini bertujuan untuk membangun endpoint baru yang akan mencari tempat makan terdekat dengan memanfaatkan layanan eksternal Google Places API. Respons dari Google akan dipangkas (di-mapping) agar data yang dikirimkan ke frontend lebih bersih dan relevan.

## Tahapan Implementasi

Berikut adalah langkah-langkah detail yang harus Anda (sebagai programmer) kerjakan secara berurutan:

### 1. Konfigurasi Environment (Variabel API Key)
- Pastikan aplikasi dapat membaca Google API Key. Gunakan variabel `process.env.GOOGLE_API_KEY` di dalam kode.
- (Opsional) Anda dapat mendefinisikan kunci `GOOGLE_API_KEY=` di dalam file `.env` untuk keperluan *testing* di komputer Anda.

### 2. Pembuatan Controller Places (`src/controllers/placeController.ts`)
Buatlah file baru `placeController.ts` di dalam direktori `src/controllers/` dengan instruksi berikut:
- **Import Module**: Lakukan import library `axios` untuk HTTP Request, tipe `Request` & `Response` dari `express`, dan helper response (`successResponse`, `errorResponse`) dari `../utils/response.js`.
- **Fungsi Utama**: Buat fungsi asinkron (misalnya `getNearbyPlaces`).
- **Ambil Parameter**: Dapatkan variabel parameter seperti lintang (`lat`) dan bujur (`lng`) dari URL query parameter (`req.query`).
- **Pemanggilan API**: Gunakan Axios untuk memanggil URL Google Places API (contoh: `https://maps.googleapis.com/maps/api/place/nearbysearch/json`).
  - Masukkan parameter query (params) seperti `location` (gabungan `lat,lng`), `radius` (misal default 1500), `type` (sebaiknya hardcode `restaurant`), dan `key` dari `process.env.GOOGLE_API_KEY`.

### 3. Mapping Respons API (Pemangkasan JSON)
- Dari data *response* Google yang diterima (biasanya dalam `response.data.results`), lakukan fungsi `.map()`.
- Petakan setiap item pada *array* tersebut menjadi objek baru yang **hanya** berisi atribut berikut:
  - `place_id`: (diambil dari `item.place_id`)
  - `name`: (diambil dari `item.name`)
  - `vicinity`: (diambil dari `item.vicinity` atau alamat singkat)
  - `koordinat`: (diambil dari `item.geometry.location`, simpan sebagai format `lat` dan `lng`)
- Kirim kembali hasil array data yang sudah bersih (di-*map*) ini kepada klien (client) melalui helper `successResponse`.
- Tangkap error (blok `catch`) apabila panggilan API gagal dan kembalikan helper `errorResponse`.

### 4. Pembuatan Router Places (`src/routes/placeRoutes.ts`)
Buat file `placeRoutes.ts` di folder `src/routes/`:
- Lakukan import `Router` dari `express`.
- Import fungsi `getNearbyPlaces` dari controller yang baru saja Anda buat (ingat, gunakan ekstensi `.js` pada path import karena format ESM: `import { getNearbyPlaces } from '../controllers/placeController.js'`).
- Daftarkan endpoint `GET /nearby` dan ikat (bind) dengan fungsi `getNearbyPlaces`.
- `export default` router tersebut.

### 5. Integrasi Router pada Entry Point (`src/index.ts`)
Buka file utama `src/index.ts`:
- Import `placeRoutes` yang baru saja dibuat.
- Daftarkan ke Express menggunakan `app.use('/api/places', placeRoutes);`.

## Format Response JSON

Pastikan response API selalu mengikuti format seragam berikut agar mudah dikonsumsi oleh tim frontend.

**Format Response Sukses:**
```json
{
  "status": "success",
  "message": "Data berhasil diambil",
  "data": {
    "place_id": "ChIJN1t_xxxxx",
    "name": "Nasi Goreng Berkah",
    "items": [
      {
        "id": 1,
        "nama_item": "Nasi Goreng Spesial",
        "harga": "25000"
      }
    ]
  }
}
```
*(Catatan: Untuk endpoint nearby, key `data` akan berisi array dari tempat makan hasil mapping. Struktur di atas adalah contoh standar).*

**Format Response Gagal (Error):**
```json
{
  "status": "error",
  "message": "Pesan error untuk user (misal: Gagal mengambil data)",
  "error": "Detail error teknis dari sistem (misal: AxiosError: Network Error)"
}
```

---
**Kriteria Kelulusan (Selesai):**
Tugas ini dianggap berhasil jika aplikasi tidak memunculkan *error* kompilasi, dan ketika kita melakukan request `GET /api/places/nearby?lat=...&lng=...`, server akan mengembalikan JSON respon yang rapi (hanya menyisakan 4 properti yaitu `place_id`, `name`, `vicinity`, dan `koordinat` untuk setiap item rumah makan).

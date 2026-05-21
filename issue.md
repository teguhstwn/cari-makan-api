# Implementasi Endpoint Rekomendasi Tempat Makan Berdasarkan Rating

## Deskripsi
Tugas ini bertujuan untuk membuat endpoint baru `GET /api/places/recommendations` yang berfungsi untuk memberikan rekomendasi tempat makan terbaik di sekitar pengguna. Rekomendasi ini didasarkan pada filter rating yang tinggi dan diurutkan berdasarkan rating dan jumlah ulasan terbanyak dari data Google Places API.

## Tahapan Implementasi

Berikut adalah langkah-langkah detail yang harus Anda (sebagai programmer) kerjakan secara berurutan:

### 1. Penambahan Fungsi di Controller (`src/controllers/placeController.ts`)
Buka file `placeController.ts` dan buat fungsi *asynchronous* baru (misalnya `getRecommendedPlaces`).
- **Ambil Parameter**: Dapatkan `lat` dan `lng` dari URL query (`req.query`). Lakukan validasi awal: jika parameter tersebut kosong, kembalikan `errorResponse` dengan status 400.
- **Pemanggilan API**: Panggil layanan Google Places API Nearby Search menggunakan Axios (sama seperti pada endpoint `/nearby`). Pastikan mengirimkan `location` (dari `lat,lng`), `radius`, `type` (sebaiknya gunakan default `'restaurant'`), dan `key`.
- **Filter & Sorting Data (Di Memory)**:
  - Dari `response.data.results`, lakukan proses penyaringan (**Filter**). Gunakan `.filter()` untuk hanya menyisakan data tempat makan yang memenuhi syarat: `rating >= 4.0` dan `user_ratings_total > 0`.
  - Lakukan proses pengurutan (**Sort**). Gunakan `.sort()` untuk mengurutkan array secara menurun (*descending*). Logika urutannya: prioritaskan berdasarkan `rating` tertinggi. Jika terdapat tempat dengan `rating` yang sama besarnya, maka urutkan berdasarkan `user_ratings_total` terbanyak.
- **Mapping Respons API**:
  - Gunakan `.map()` pada data yang telah difilter dan disortir tersebut. Petakan setiap item menjadi objek berformat berikut:
    - `place_id`
    - `name`
    - `vicinity`
    - `koordinat`: berisi format `{ lat, lng }` dari `geometry.location`
    - `rating`: (ambil dari `item.rating`)
    - `user_ratings_total`: (ambil dari `item.user_ratings_total`)
    - `items`: `[]` (set array kosong sebagai placeholder)
- Kembalikan data tersebut menggunakan helper `successResponse`. Pastikan menggunakan blok `try...catch` dan panggil `errorResponse` jika terjadi kesalahan.

### 2. Penambahan Router (`src/routes/placeRoutes.ts`)
Buka file `placeRoutes.ts`:
- Lakukan import fungsi `getRecommendedPlaces` dari controller (`placeController.js`).
- Daftarkan endpoint baru tersebut dengan kode: `router.get('/recommendations', getRecommendedPlaces);`.

### 3. Standar Format Response JSON
Pastikan hasil pemetaan (mapping) mematuhi format JSON standar sukses yang telah disepakati oleh tim frontend.

**Contoh Response Sukses:**
```json
{
  "status": "success",
  "message": "Data rekomendasi berhasil diambil",
  "data": [
    {
      "place_id": "ChIJN1t_xxxxx",
      "name": "Nasi Goreng Spesial",
      "vicinity": "Jl. Mawar No. 1",
      "koordinat": {
        "lat": -6.2088,
        "lng": 106.8456
      },
      "rating": 4.8,
      "user_ratings_total": 1250,
      "items": []
    }
  ]
}
```

---
**Kriteria Kelulusan (Selesai):**
Tugas ini dianggap berhasil jika:
1. Tidak ada *error* saat kompilasi.
2. Ketika mengakses `GET /api/places/recommendations?lat=...&lng=...`, server merespon dengan daftar tempat makan.
3. Seluruh tempat makan pada array `data` memiliki `rating` bernilai 4.0 ke atas.
4. Data telah terurut dari rating tertinggi (dan ulasan terbanyak).
5. Terdapat penambahan *field* baru yaitu `rating` dan `user_ratings_total` sesuai struktur pada contoh JSON di atas.

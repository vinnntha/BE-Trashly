# ALUR LOGIKA BACKEND (NEXT.JS ROUTE HANDLERS & PRISMA)

Backend bertugas sebagai "otak" dari aplikasi. Ia menerima permintaan (*request*) dari Frontend, memproses aturan bisnis (seperti validasi saldo atau perhitungan koin), berinteraksi dengan database melalui Prisma, dan mengembalikan jawaban (*response*) berupa data JSON.

## 1. Penerimaan Request & Routing API
Setiap aksi di Frontend akan memanggil endpoint Backend yang ada di dalam folder `app/api/.../route.ts`. 
Contoh Endpoint:
- `GET /api/kategori-sampah` (Untuk mengambil daftar sampah)[cite: 1]
- `POST /api/kategori-sampah` (Untuk menambah kategori baru oleh Admin)[cite: 1]

## 2. Pengecekan Autentikasi (Security Guard)
Sebelum memproses data, backend akan mengecek identitas pengirim (kecuali untuk endpoint publik seperti login/register).
- **Logika**: Backend membaca *Header Authorization* atau *Cookies* untuk mencari token JWT.
- Jika token tidak ada, kedaluwarsa, atau dimanipulasi, backend langsung memutus proses dan membalas dengan error `401 Unauthorized`.
- Jika token valid, backend akan mengekstrak data identitas (misal: ID Nasabah dan Role) untuk digunakan di langkah selanjutnya.

## 3. Validasi Data (Payload Checker)
Jika request tersebut membawa data (contohnya `POST` atau `PUT`), backend wajib mengecek kelengkapannya.
- **Logika**: Apakah field `berat_kg` sudah diisi? Apakah isinya berupa angka (bukan huruf)?
- Jika data tidak valid, backend menolak dan mengembalikan pesan error `400 Bad Request` yang berisi detail kesalahan.

## 4. Operasi Database dengan Prisma (CRUD)
Setelah data dipastikan valid dan aman, backend memanggil ORM Prisma untuk berinteraksi dengan database MySQL/PostgreSQL.

**Contoh Alur Kompleks: Nasabah Menukar Poin dengan Hadiah**[cite: 1]
1. Backend menerima `id_hadiah` dari Frontend.
2. Prisma mencari data hadiah tersebut (cek harga poin dan ketersediaan stok).
3. Prisma mengecek data profil Nasabah (apakah saldo poin saat ini mencukupi?).
4. **Validasi Aturan Bisnis**: Jika saldo poin nasabah < poin yang dibutuhkan hadiah, kembalikan error "Saldo poin tidak cukup".
5. **Database Transaction**: Jika saldo cukup, backend melakukan beberapa perintah Prisma sekaligus secara berurutan:
   - Kurangi poin nasabah (`UPDATE`).
   - Kurangi stok hadiah (`UPDATE`).
   - Catat riwayat penukaran di tabel `PenukaranPoin` (`INSERT`)[cite: 1].
6. Jika salah satu proses gagal (misal koneksi terputus), seluruh transaksi dibatalkan (*rollback*) agar data poin tidak terpotong sia-sia.

## 5. Pengembalian Response JSON
Setelah operasi database berhasil, backend membungkus hasilnya ke dalam format standar JSON.
- **Logika**: Mengembalikan status HTTP (contoh: `201 Created`) dengan isi payload berisi status sukses, pesan informatif, dan data terbaru hasil olahan database. Format JSON ini yang kemudian "ditangkap" dan diterjemahkan oleh Frontend.
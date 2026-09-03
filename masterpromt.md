# MASTER PROMPT — Generate Database (Prisma Schema) Trashly
**Stack**: NestJS + Prisma ORM + PostgreSQL
**Kategori UKK**: Fullstack (izin sekolah menggunakan stack JS/NestJS, tanpa konsumsi API eksternal, database dikelola sendiri)

Salin seluruh isi di bawah ini ke AI assistant (Claude/ChatGPT/dll) untuk men-generate `schema.prisma` beserta seed data.

---

## PERAN
Kamu adalah senior backend engineer yang ahli NestJS, Prisma ORM, dan PostgreSQL. Tugasmu adalah membuatkan **file `schema.prisma` lengkap** untuk aplikasi bernama **Trashly** — sistem Bank Sampah Digital & Daur Ulang (Eco-Waste Management).

## KONTEKS PROYEK
Trashly adalah aplikasi fullstack (dikerjakan sendiri, database dibuat & dikelola sendiri, tanpa konsumsi API eksternal panitia — karena kategori Fullstack). Ada dua jenis pengguna:
1. **Admin Bank Sampah** — mengelola unit bank sampah, nasabah, kategori sampah, hadiah, dan verifikasi setoran.
2. **Nasabah** — mendaftar, mengajukan setoran sampah, memiliki saldo poin, dan menukar poin dengan hadiah.

> Catatan: karena ini kategori **Fullstack** (bukan Backend/Frontend/Mobile), **tidak perlu** membuat tabel/mekanisme multi-tenant `App Maker` (`x-app-key`) — itu hanya berlaku untuk peserta kategori Backend/Frontend/Mobile yang mengonsumsi API panitia. Skema database cukup mencakup entitas inti Bank Sampah saja.

## ENTITAS & RELASI (ERD ACUAN)
Buat model Prisma berikut, dengan relasi sesuai penjelasan:

1. **User** (tabel akun login gabungan)
   - `id` (PK, UUID)
   - `username` (unique, string)
   - `password` (string, hashed)
   - `role` (enum: `ADMIN`, `NASABAH`)
   - relasi 1:1 opsional ke `Nasabah` dan ke `AdminBank` (satu user hanya salah satu, sesuai role)
   - timestamps (`createdAt`, `updatedAt`)

2. **Nasabah**
   - `id` (PK, UUID)
   - `namaNasabah` (string)
   - `alamat` (text)
   - `telp` (string)
   - `saldoPoin` (int/double, default 0)
   - `foto` (string, nullable — URL/path)
   - `userId` (FK unik → User.id)
   - relasi 1:N ke `SetorSampah`
   - relasi 1:N ke `PenukaranPoin`
   - timestamps

3. **AdminBank**
   - `id` (PK, UUID)
   - `namaUnit` (string)
   - `namaPengelola` (string)
   - `telp` (string)
   - `userId` (FK unik → User.id)
   - relasi 1:N ke `SetorSampah` (admin yang memverifikasi)
   - timestamps

4. **KategoriSampah**
   - `id` (PK, UUID)
   - `namaKategori` (string)
   - `hargaPerKg` (double)
   - `poinPerKg` (double)
   - `jenis` (enum: `plastik`, `kertas`, `logam`, `kaca`)
   - `foto` (string, nullable)
   - relasi 1:N ke `DetailSetor`
   - timestamps

5. **SetorSampah** (header pengajuan setoran)
   - `id` (PK, UUID)
   - `kodeSetor` (unique, string — generate format `STR-YYYYMM-XXXX`)
   - `tanggal` (DateTime)
   - `status` (enum: `menunggu_konfirmasi`, `diverifikasi`, `ditolak`, `selesai`, default `menunggu_konfirmasi`)
   - `totalBeratKg` (double, default 0)
   - `totalPoin` (double, default 0)
   - `catatan` (text, nullable)
   - `catatanAdmin` (text, nullable)
   - `nasabahId` (FK → Nasabah.id)
   - `adminId` (FK → AdminBank.id, nullable — diisi saat diverifikasi)
   - relasi 1:N ke `DetailSetor`
   - timestamps

6. **DetailSetor** (item per kategori sampah dalam satu setoran, multi-item)
   - `id` (PK, UUID)
   - `setorId` (FK → SetorSampah.id)
   - `kategoriSampahId` (FK → KategoriSampah.id)
   - `beratKg` (double — estimasi awal dari nasabah)
   - `beratKgReal` (double, nullable — hasil timbangan real admin)
   - `subtotalPoin` (double)
   - timestamps

7. **Hadiah**
   - `id` (PK, UUID)
   - `namaHadiah` (string)
   - `poinDibutuhkan` (double)
   - `stok` (int)
   - `foto` (string, nullable)
   - relasi 1:N ke `PenukaranPoin`
   - timestamps

8. **PenukaranPoin**
   - `id` (PK, UUID)
   - `kodePenukaran` (unique, string — generate format `TKR-YYYYMM-XXXX`)
   - `tanggal` (DateTime)
   - `nasabahId` (FK → Nasabah.id)
   - `hadiahId` (FK → Hadiah.id)
   - `poinTerpakai` (double)
   - `status` (enum: `diproses`, `selesai`, default `diproses`)
   - timestamps

## ATURAN TEKNIS YANG WAJIB DIIKUTI
- Gunakan `provider = "postgresql"` di datasource.
- Primary key semua tabel bertipe `String @id @default(uuid())`.
- Semua relasi wajib eksplisit dengan `@relation(fields: [...], references: [...])` dan beri nama relasi bila ada ambiguitas (misal dua FK Nasabah pada tabel berbeda).
- Tambahkan `onDelete: Cascade` pada relasi child yang wajar dihapus bersama induknya (contoh: `DetailSetor` ikut terhapus jika `SetorSampah` dihapus), tapi **jangan cascade** pada relasi yang berisiko kehilangan data transaksi/audit (misal `Nasabah` ke `SetorSampah` sebaiknya `Restrict`).
- Tambahkan `@@index` pada kolom yang sering difilter: `status` di `SetorSampah`, `tanggal` di `SetorSampah` & `PenukaranPoin`, `jenis` di `KategoriSampah`.
- Gunakan `@@map` untuk nama tabel snake_case (contoh: `@@map("setor_sampah")`), sementara nama model tetap PascalCase agar idiomatik NestJS/Prisma.
- Field timestamps: `createdAt DateTime @default(now())` dan `updatedAt DateTime @updatedAt`.
- Semua enum didefinisikan dengan `enum` Prisma (huruf besar untuk konstanta: `ADMIN`, `NASABAH`, `PLASTIK`, dst) tapi berikan `@map` bila representasi di DB perlu lowercase agar konsisten dengan Kontrak API (contoh value seperti `"menunggu_konfirmasi"`, `"diverifikasi"`, `"plastik"`).

## OUTPUT YANG DIHARAPKAN
Berikan jawaban dalam urutan berikut:
1. **File `schema.prisma` lengkap** (satu blok kode, siap pakai — generator client + datasource + seluruh model & enum di atas).
2. **Penjelasan singkat tiap relasi** (poin-poin, bukan paragraf panjang) — khususnya kenapa `onDelete` dipilih Cascade/Restrict pada bagian tertentu.
3. **File `prisma/seed.ts`** sederhana yang mengisi:
   - 1 Admin Bank + 2 Nasabah (password di-hash dengan bcrypt)
   - 4 Kategori Sampah (mewakili 4 jenis: plastik, kertas, logam, kaca)
   - 3 Hadiah
   - 1 contoh SetorSampah beserta DetailSetor
   - 1 contoh PenukaranPoin
4. **Perintah CLI** yang perlu dijalankan setelah schema jadi (`prisma migrate dev`, `prisma db seed`, dll) beserta konfigurasi `package.json` untuk seed script ala NestJS.

Jangan tambahkan modul/controller/service NestJS di jawaban ini — fokus HANYA pada schema database, relasi, dan seed data terlebih dahulu.
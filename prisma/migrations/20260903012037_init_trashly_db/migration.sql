-- CreateEnum
CREATE TYPE "role" AS ENUM ('admin', 'nasabah');

-- CreateEnum
CREATE TYPE "jenis_kategori" AS ENUM ('plastik', 'kertas', 'logam', 'kaca');

-- CreateEnum
CREATE TYPE "status_setor" AS ENUM ('menunggu_konfirmasi', 'diverifikasi', 'ditolak', 'selesai');

-- CreateEnum
CREATE TYPE "status_penukaran" AS ENUM ('diproses', 'selesai');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nasabah" (
    "id" TEXT NOT NULL,
    "nama_nasabah" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "telp" TEXT NOT NULL,
    "saldo_poin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "foto" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nasabah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_bank" (
    "id" TEXT NOT NULL,
    "nama_unit" TEXT NOT NULL,
    "nama_pengelola" TEXT NOT NULL,
    "telp" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori_sampah" (
    "id" TEXT NOT NULL,
    "nama_kategori" TEXT NOT NULL,
    "harga_per_kg" DOUBLE PRECISION NOT NULL,
    "poin_per_kg" DOUBLE PRECISION NOT NULL,
    "jenis" "jenis_kategori" NOT NULL,
    "foto" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kategori_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setor_sampah" (
    "id" TEXT NOT NULL,
    "kode_setor" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "status_setor" NOT NULL DEFAULT 'menunggu_konfirmasi',
    "total_berat_kg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_poin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "catatan" TEXT,
    "catatan_admin" TEXT,
    "nasabah_id" TEXT NOT NULL,
    "admin_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "setor_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_setor" (
    "id" TEXT NOT NULL,
    "setor_id" TEXT NOT NULL,
    "kategori_sampah_id" TEXT NOT NULL,
    "berat_kg" DOUBLE PRECISION NOT NULL,
    "berat_kg_real" DOUBLE PRECISION,
    "subtotal_poin" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detail_setor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hadiah" (
    "id" TEXT NOT NULL,
    "nama_hadiah" TEXT NOT NULL,
    "poin_dibutuhkan" DOUBLE PRECISION NOT NULL,
    "stok" INTEGER NOT NULL,
    "foto" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hadiah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penukaran_poin" (
    "id" TEXT NOT NULL,
    "kode_penukaran" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nasabah_id" TEXT NOT NULL,
    "hadiah_id" TEXT NOT NULL,
    "poin_terpakai" DOUBLE PRECISION NOT NULL,
    "status" "status_penukaran" NOT NULL DEFAULT 'diproses',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penukaran_poin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "nasabah_user_id_key" ON "nasabah"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_bank_user_id_key" ON "admin_bank"("user_id");

-- CreateIndex
CREATE INDEX "kategori_sampah_jenis_idx" ON "kategori_sampah"("jenis");

-- CreateIndex
CREATE UNIQUE INDEX "setor_sampah_kode_setor_key" ON "setor_sampah"("kode_setor");

-- CreateIndex
CREATE INDEX "setor_sampah_status_idx" ON "setor_sampah"("status");

-- CreateIndex
CREATE INDEX "setor_sampah_tanggal_idx" ON "setor_sampah"("tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "penukaran_poin_kode_penukaran_key" ON "penukaran_poin"("kode_penukaran");

-- CreateIndex
CREATE INDEX "penukaran_poin_tanggal_idx" ON "penukaran_poin"("tanggal");

-- AddForeignKey
ALTER TABLE "nasabah" ADD CONSTRAINT "nasabah_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_bank" ADD CONSTRAINT "admin_bank_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setor_sampah" ADD CONSTRAINT "setor_sampah_nasabah_id_fkey" FOREIGN KEY ("nasabah_id") REFERENCES "nasabah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setor_sampah" ADD CONSTRAINT "setor_sampah_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin_bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_setor" ADD CONSTRAINT "detail_setor_setor_id_fkey" FOREIGN KEY ("setor_id") REFERENCES "setor_sampah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_setor" ADD CONSTRAINT "detail_setor_kategori_sampah_id_fkey" FOREIGN KEY ("kategori_sampah_id") REFERENCES "kategori_sampah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penukaran_poin" ADD CONSTRAINT "penukaran_poin_nasabah_id_fkey" FOREIGN KEY ("nasabah_id") REFERENCES "nasabah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penukaran_poin" ADD CONSTRAINT "penukaran_poin_hadiah_id_fkey" FOREIGN KEY ("hadiah_id") REFERENCES "hadiah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

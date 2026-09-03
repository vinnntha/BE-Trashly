import { PrismaClient, Role, JenisKategori, StatusSetor, StatusPenukaran } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Helper to hash password using bcrypt (matching AuthModule & Passport) with fallback to pbkdf2
function hashPassword(password: string): string {
  try {
    return bcrypt.hashSync(password, 10);
  } catch {
    const salt = 'trashly_salt_2026';
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  }
}

async function main() {
  console.log('🌱 Starting database seeding for Trashly Eco-Waste Management...');

  // 1. Clean existing records (in reverse dependency order)
  await prisma.detailSetor.deleteMany();
  await prisma.setorSampah.deleteMany();
  await prisma.penukaranPoin.deleteMany();
  await prisma.hadiah.deleteMany();
  await prisma.kategoriSampah.deleteMany();
  await prisma.nasabah.deleteMany();
  await prisma.adminBank.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // 2. Create Users & Profiles
  // Admin User
  const userAdmin = await prisma.user.create({
    data: {
      username: 'admin_unit1',
      password: hashPassword('admin123'),
      role: Role.ADMIN,
      adminBank: {
        create: {
          namaUnit: 'Bank Sampah Central Trashly',
          namaPengelola: 'Budi Santoso',
          telp: '081234567890',
        },
      },
    },
    include: {
      adminBank: true,
    },
  });

  // Nasabah User 1
  const userNasabah1 = await prisma.user.create({
    data: {
      username: 'nasabah_budi',
      password: hashPassword('nasabah123'),
      role: Role.NASABAH,
      nasabah: {
        create: {
          namaNasabah: 'Budi Pratama',
          alamat: 'Jl. Merdeka No. 12, Bandung',
          telp: '085678901234',
          saldoPoin: 150.0,
          foto: 'https://placehold.co/150x150/png?text=Budi',
        },
      },
    },
    include: {
      nasabah: true,
    },
  });

  // Nasabah User 2
  const userNasabah2 = await prisma.user.create({
    data: {
      username: 'nasabah_siti',
      password: hashPassword('nasabah123'),
      role: Role.NASABAH,
      nasabah: {
        create: {
          namaNasabah: 'Siti Rahmawati',
          alamat: 'Jl. Melati No. 45, Bandung',
          telp: '087890123456',
          saldoPoin: 50.0,
          foto: 'https://placehold.co/150x150/png?text=Siti',
        },
      },
    },
    include: {
      nasabah: true,
    },
  });

  console.log('👤 Created 1 Admin Bank & 2 Nasabah users.');

  // 3. Create Kategori Sampah
  const katPlastik = await prisma.kategoriSampah.create({
    data: {
      namaKategori: 'Plastik PET (Botol Bening)',
      hargaPerKg: 4000,
      poinPerKg: 40,
      jenis: JenisKategori.PLASTIK,
      foto: 'https://placehold.co/300x200/png?text=Plastik+PET',
    },
  });

  const katKertas = await prisma.kategoriSampah.create({
    data: {
      namaKategori: 'Kertas Kardus Bekas',
      hargaPerKg: 2500,
      poinPerKg: 25,
      jenis: JenisKategori.KERTAS,
      foto: 'https://placehold.co/300x200/png?text=Kertas+Kardus',
    },
  });

  const katLogam = await prisma.kategoriSampah.create({
    data: {
      namaKategori: 'Logam / Kaleng Aluminium',
      hargaPerKg: 10000,
      poinPerKg: 100,
      jenis: JenisKategori.LOGAM,
      foto: 'https://placehold.co/300x200/png?text=Kaleng+Aluminium',
    },
  });

  const katKaca = await prisma.kategoriSampah.create({
    data: {
      namaKategori: 'Kaca Botol Kerapu',
      hargaPerKg: 1500,
      poinPerKg: 15,
      jenis: JenisKategori.KACA,
      foto: 'https://placehold.co/300x200/png?text=Botol+Kaca',
    },
  });

  console.log('♻️ Created 4 Kategori Sampah (Plastik, Kertas, Logam, Kaca).');

  // 4. Create Hadiah
  const hadiah1 = await prisma.hadiah.create({
    data: {
      namaHadiah: 'Minyak Goreng 1 Liter',
      poinDibutuhkan: 100,
      stok: 25,
      foto: 'https://placehold.co/200x200/png?text=Minyak+Goreng',
    },
  });

  const hadiah2 = await prisma.hadiah.create({
    data: {
      namaHadiah: 'Voucher Pulsa Rp 25.000',
      poinDibutuhkan: 250,
      stok: 50,
      foto: 'https://placehold.co/200x200/png?text=Voucher+Pulsa',
    },
  });

  const hadiah3 = await prisma.hadiah.create({
    data: {
      namaHadiah: 'Paket Sembako Hemat',
      poinDibutuhkan: 500,
      stok: 10,
      foto: 'https://placehold.co/200x200/png?text=Sembako',
    },
  });

  console.log('🎁 Created 3 items in Katalog Hadiah.');

  // 5. Create Sample SetorSampah & DetailSetor
  const nasabah1 = userNasabah1.nasabah!;
  const adminUnit = userAdmin.adminBank!;

  const setorSampahSample = await prisma.setorSampah.create({
    data: {
      kodeSetor: 'STR-202609-0001',
      tanggal: new Date(),
      status: StatusSetor.DIVERIFIKASI,
      totalBeratKg: 5.5,
      totalPoin: 150,
      catatan: 'Setoran rutin botol dan kardus rumah tangga',
      catatanAdmin: 'Timbangan telah diverifikasi dan poin ditambahkan ke saldo nasabah',
      nasabahId: nasabah1.id,
      adminId: adminUnit.id,
      detailSetor: {
        create: [
          {
            kategoriSampahId: katPlastik.id,
            beratKg: 2.5,
            beratKgReal: 2.5,
            subtotalPoin: 100, // 2.5kg * 40 poin/kg
          },
          {
            kategoriSampahId: katKertas.id,
            beratKg: 3.0,
            beratKgReal: 3.0,
            subtotalPoin: 50, // 3.0kg * 25 poin/kg
          },
        ],
      },
    },
    include: {
      detailSetor: true,
    },
  });

  console.log(`📦 Created Sample SetorSampah header (${setorSampahSample.kodeSetor}) with 2 DetailSetor items.`);

  // 6. Create Sample PenukaranPoin
  const penukaranPoinSample = await prisma.penukaranPoin.create({
    data: {
      kodePenukaran: 'TKR-202609-0001',
      tanggal: new Date(),
      nasabahId: nasabah1.id,
      hadiahId: hadiah1.id,
      poinTerpakai: 100,
      status: StatusPenukaran.SELESAI,
    },
  });

  console.log(`🎟️ Created Sample PenukaranPoin transaction (${penukaranPoinSample.kodePenukaran}).`);

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

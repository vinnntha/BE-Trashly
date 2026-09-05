import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StatusSetor } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalNasabah,
      totalKategoriSampah,
      totalTransaksiSetor,
      totalHadiah,
      setoranSelesaiAgg,
    ] = await Promise.all([
      this.prisma.nasabah.count(),
      this.prisma.kategoriSampah.count(),
      this.prisma.setorSampah.count(),
      this.prisma.hadiah.count(),
      this.prisma.setorSampah.aggregate({
        where: {
          status: StatusSetor.SELESAI,
        },
        _sum: {
          totalBeratKg: true,
          totalPoin: true,
        },
      }),
    ]);

    const totalBeratSampahKg = Number(
      (setoranSelesaiAgg._sum.totalBeratKg ?? 0).toFixed(2),
    );
    const totalPoinTersalurkan = Number(
      (setoranSelesaiAgg._sum.totalPoin ?? 0).toFixed(2),
    );

    return {
      totalNasabah,
      totalKategoriSampah,
      totalTransaksiSetor,
      totalHadiah,
      totalBeratSampahKg,
      totalPoinTersalurkan,
    };
  }

  async getSummary(nasabahId: string) {
    if (!nasabahId) {
      throw new BadRequestException(
        'Profil nasabah tidak ditemukan untuk user ini.',
      );
    }

    const [
      nasabah,
      setoranSelesaiAgg,
      penukaranPoinAgg,
      transaksiTerakhirSetorRaw,
      transaksiTerakhirTukarRaw,
    ] = await Promise.all([
      this.prisma.nasabah.findUnique({
        where: { id: nasabahId },
        select: { saldoPoin: true },
      }),
      this.prisma.setorSampah.aggregate({
        where: {
          nasabahId,
          status: StatusSetor.SELESAI,
        },
        _sum: {
          totalBeratKg: true,
          totalPoin: true,
        },
      }),
      this.prisma.penukaranPoin.aggregate({
        where: {
          nasabahId,
        },
        _sum: {
          poinTerpakai: true,
        },
      }),
      this.prisma.setorSampah.findFirst({
        where: { nasabahId },
        orderBy: { tanggal: 'desc' },
        select: {
          kodeSetor: true,
          tanggal: true,
          totalBeratKg: true,
          totalPoin: true,
          status: true,
        },
      }),
      this.prisma.penukaranPoin.findFirst({
        where: { nasabahId },
        orderBy: { tanggal: 'desc' },
        select: {
          kodePenukaran: true,
          tanggal: true,
          poinTerpakai: true,
          status: true,
          hadiah: {
            select: {
              namaHadiah: true,
            },
          },
        },
      }),
    ]);

    if (!nasabah) {
      throw new NotFoundException('Data nasabah tidak ditemukan.');
    }

    const saldoPoinSaatIni = nasabah.saldoPoin;
    const totalSampahDisetorKg = Number(
      (setoranSelesaiAgg._sum.totalBeratKg ?? 0).toFixed(2),
    );
    const totalPoinDidapat = Number(
      (setoranSelesaiAgg._sum.totalPoin ?? 0).toFixed(2),
    );
    const totalPoinDitukar = Number(
      (penukaranPoinAgg._sum.poinTerpakai ?? 0).toFixed(2),
    );

    const transaksiTerakhirSetor = transaksiTerakhirSetorRaw
      ? {
          kodeSetor: transaksiTerakhirSetorRaw.kodeSetor,
          tanggal: transaksiTerakhirSetorRaw.tanggal,
          beratKg: transaksiTerakhirSetorRaw.totalBeratKg,
          poin: transaksiTerakhirSetorRaw.totalPoin,
          status: transaksiTerakhirSetorRaw.status.toLowerCase(),
        }
      : null;

    const transaksiTerakhirTukar = transaksiTerakhirTukarRaw
      ? {
          kodePenukaran: transaksiTerakhirTukarRaw.kodePenukaran,
          tanggal: transaksiTerakhirTukarRaw.tanggal,
          namaHadiah: transaksiTerakhirTukarRaw.hadiah.namaHadiah,
          poinTerpakai: transaksiTerakhirTukarRaw.poinTerpakai,
          status: transaksiTerakhirTukarRaw.status.toLowerCase(),
        }
      : null;

    return {
      saldoPoinSaatIni,
      totalSampahDisetorKg,
      totalPoinDidapat,
      totalPoinDitukar,
      transaksiTerakhirSetor,
      transaksiTerakhirTukar,
    };
  }
}


import { Injectable } from '@nestjs/common';
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
}

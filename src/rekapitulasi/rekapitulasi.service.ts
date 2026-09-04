import { BadRequestException, Injectable } from '@nestjs/common';
import { StatusSetor } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { parseMonthRange } from '../common/utils/date.util';

@Injectable()
export class RekapitulasiService {
  constructor(private readonly prisma: PrismaService) {}

  async getRekapitulasiBulanan(bulan?: string) {
    if (!bulan) {
      throw new BadRequestException(
        "Parameter query 'bulan' wajib diisi dengan format YYYY-MM (contoh: '2026-09').",
      );
    }

    const { startDate, endDate } = parseMonthRange(bulan);

    const [setoranSelesai, totalTransaksiPenukaran, penukaranPoinAgg] =
      await Promise.all([
        this.prisma.setorSampah.findMany({
          where: {
            status: StatusSetor.SELESAI,
            tanggal: {
              gte: startDate,
              lt: endDate,
            },
          },
          include: {
            detailSetor: {
              include: {
                kategoriSampah: true,
              },
            },
          },
        }),
        this.prisma.penukaranPoin.count({
          where: {
            tanggal: {
              gte: startDate,
              lt: endDate,
            },
          },
        }),
        this.prisma.penukaranPoin.aggregate({
          where: {
            tanggal: {
              gte: startDate,
              lt: endDate,
            },
          },
          _sum: {
            poinTerpakai: true,
          },
        }),
      ]);

    const breakdownJenisSampah: Record<
      string,
      { tonaseKg: number; rupiah: number; poin: number }
    > = {
      plastik: { tonaseKg: 0, rupiah: 0, poin: 0 },
      kertas: { tonaseKg: 0, rupiah: 0, poin: 0 },
      logam: { tonaseKg: 0, rupiah: 0, poin: 0 },
      kaca: { tonaseKg: 0, rupiah: 0, poin: 0 },
    };

    let totalKg = 0;
    let totalEstimasiPembayaranRupiah = 0;
    let totalPoinDiterbitkan = 0;

    for (const setor of setoranSelesai) {
      totalPoinDiterbitkan += setor.totalPoin;

      for (const detail of setor.detailSetor) {
        const weight = detail.beratKgReal ?? detail.beratKg;
        const rupiah = weight * detail.kategoriSampah.hargaPerKg;
        const poin = detail.subtotalPoin;

        totalKg += weight;
        totalEstimasiPembayaranRupiah += rupiah;

        const jenisKey = detail.kategoriSampah.jenis.toLowerCase();
        if (breakdownJenisSampah[jenisKey]) {
          breakdownJenisSampah[jenisKey].tonaseKg += weight;
          breakdownJenisSampah[jenisKey].rupiah += rupiah;
          breakdownJenisSampah[jenisKey].poin += poin;
        }
      }
    }

    totalKg = Number(totalKg.toFixed(2));
    const totalTon = Number((totalKg / 1000).toFixed(4));
    totalEstimasiPembayaranRupiah = Number(
      totalEstimasiPembayaranRupiah.toFixed(2),
    );
    totalPoinDiterbitkan = Number(totalPoinDiterbitkan.toFixed(2));

    for (const key of Object.keys(breakdownJenisSampah)) {
      breakdownJenisSampah[key].tonaseKg = Number(
        breakdownJenisSampah[key].tonaseKg.toFixed(2),
      );
      breakdownJenisSampah[key].rupiah = Number(
        breakdownJenisSampah[key].rupiah.toFixed(2),
      );
      breakdownJenisSampah[key].poin = Number(
        breakdownJenisSampah[key].poin.toFixed(2),
      );
    }

    const totalPoinTerpakai = penukaranPoinAgg._sum.poinTerpakai ?? 0;

    return {
      bulan,
      totalKg,
      totalTon,
      totalEstimasiPembayaranRupiah,
      totalPoinDiterbitkan,
      breakdownJenisSampah,
      rekapitulasiPenukaranPoin: {
        totalTransaksiPenukaran,
        totalPoinTerpakai,
      },
    };
  }
}

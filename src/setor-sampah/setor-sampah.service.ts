import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, StatusSetor } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VerifySetorSampahDto } from './dto/verify-setor-sampah.dto';
import { CreateSetorSampahDto } from './dto/create-setor-sampah.dto';
import { parseMonthRange } from '../common/utils/date.util';

@Injectable()
export class SetorSampahService {
  constructor(private readonly prisma: PrismaService) {}

  async findAdminList(query: { status?: string; bulan?: string }) {
    const whereClause: any = {};

    if (query.status) {
      const normalizedStatus = query.status.toUpperCase();
      if (!(normalizedStatus in StatusSetor)) {
        throw new BadRequestException(
          `Status filter tidak valid. Nilai yang diperbolehkan: menunggu_konfirmasi, diverifikasi, ditolak, selesai`,
        );
      }
      whereClause.status = normalizedStatus as StatusSetor;
    }

    if (query.bulan) {
      const { startDate, endDate } = parseMonthRange(query.bulan);
      whereClause.tanggal = {
        gte: startDate,
        lt: endDate,
      };
    }

    const list = await this.prisma.setorSampah.findMany({
      where: whereClause,
      orderBy: { tanggal: 'desc' },
      select: {
        id: true,
        kodeSetor: true,
        tanggal: true,
        status: true,
        totalBeratKg: true,
        totalPoin: true,
        nasabah: {
          select: {
            id: true,
            namaNasabah: true,
            telp: true,
          },
        },
      },
    });

    return list.map((item) => ({
      ...item,
      status: item.status.toLowerCase(),
    }));
  }

  async verify(id: string, dto: VerifySetorSampahDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const adminBank = await tx.adminBank.findUnique({
        where: { userId },
      });

      const setorSampah = await tx.setorSampah.findUnique({
        where: { id },
        include: {
          detailSetor: {
            include: {
              kategoriSampah: true,
            },
          },
          nasabah: true,
        },
      });

      if (!setorSampah) {
        throw new NotFoundException(
          `Transaksi setoran dengan ID '${id}' tidak ditemukan.`,
        );
      }

      if (
        setorSampah.status === StatusSetor.SELESAI ||
        setorSampah.status === StatusSetor.DITOLAK
      ) {
        throw new BadRequestException(
          'Transaksi ini sudah final dan tidak dapat diubah lagi.',
        );
      }

      const targetStatus = dto.status.toUpperCase() as StatusSetor;
      let calculatedTotalBeratKg = setorSampah.totalBeratKg;
      let calculatedTotalPoin = setorSampah.totalPoin;

      if (dto.itemsReal && dto.itemsReal.length > 0) {
        for (const item of dto.itemsReal) {
          const detail = setorSampah.detailSetor.find(
            (d) => d.kategoriSampahId === item.kategoriSampahId,
          );

          if (!detail) {
            throw new BadRequestException(
              `Kategori sampah dengan ID '${item.kategoriSampahId}' tidak terdaftar dalam transaksi setoran ini.`,
            );
          }

          const poinPerKg = detail.kategoriSampah.poinPerKg;
          const subtotalPoin = Number(
            (item.beratKgReal * poinPerKg).toFixed(2),
          );

          await tx.detailSetor.update({
            where: { id: detail.id },
            data: {
              beratKgReal: item.beratKgReal,
              subtotalPoin,
            },
          });

          detail.beratKgReal = item.beratKgReal;
          detail.subtotalPoin = subtotalPoin;
        }

        calculatedTotalBeratKg = setorSampah.detailSetor.reduce(
          (sum, d) => sum + (d.beratKgReal ?? d.beratKg),
          0,
        );
        calculatedTotalPoin = setorSampah.detailSetor.reduce(
          (sum, d) => sum + d.subtotalPoin,
          0,
        );

        calculatedTotalBeratKg = Number(calculatedTotalBeratKg.toFixed(2));
        calculatedTotalPoin = Number(calculatedTotalPoin.toFixed(2));
      }

      if (targetStatus === StatusSetor.SELESAI) {
        await tx.nasabah.update({
          where: { id: setorSampah.nasabahId },
          data: {
            saldoPoin: {
              increment: calculatedTotalPoin,
            },
          },
        });
      }

      const updated = await tx.setorSampah.update({
        where: { id },
        data: {
          status: targetStatus,
          catatanAdmin: dto.catatanAdmin,
          adminId: adminBank?.id ?? null,
          totalBeratKg: calculatedTotalBeratKg,
          totalPoin: calculatedTotalPoin,
        },
      });

      return {
        id: updated.id,
        status: updated.status.toLowerCase(),
        totalPoin: updated.totalPoin,
        catatanAdmin: updated.catatanAdmin,
      };
    });
  }

  async findOne(id: string, user: { id: string; role: Role }) {
    const setor = await this.prisma.setorSampah.findUnique({
      where: { id },
      include: {
        nasabah: {
          select: {
            id: true,
            namaNasabah: true,
            alamat: true,
            telp: true,
            userId: true,
          },
        },
        admin: {
          select: {
            id: true,
            namaUnit: true,
            namaPengelola: true,
            telp: true,
          },
        },
        detailSetor: {
          include: {
            kategoriSampah: {
              select: {
                id: true,
                namaKategori: true,
                jenis: true,
                hargaPerKg: true,
                poinPerKg: true,
              },
            },
          },
        },
      },
    });

    if (!setor) {
      throw new NotFoundException(
        `Transaksi setoran sampah dengan ID '${id}' tidak ditemukan.`,
      );
    }

    if (user.role === Role.NASABAH && setor.nasabah.userId !== user.id) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses untuk melihat struk setoran ini.',
      );
    }

    return {
      id: setor.id,
      kodeSetor: setor.kodeSetor,
      tanggal: setor.tanggal,
      status: setor.status.toLowerCase(),
      totalBeratKg: setor.totalBeratKg,
      totalPoin: setor.totalPoin,
      catatan: setor.catatan,
      catatanAdmin: setor.catatanAdmin,
      nasabah: {
        id: setor.nasabah.id,
        namaNasabah: setor.nasabah.namaNasabah,
        alamat: setor.nasabah.alamat,
        telp: setor.nasabah.telp,
      },
      admin: setor.admin
        ? {
            id: setor.admin.id,
            namaUnit: setor.admin.namaUnit,
            namaPengelola: setor.admin.namaPengelola,
            telp: setor.admin.telp,
          }
        : null,
      items: setor.detailSetor.map((d) => ({
        id: d.id,
        kategoriSampahId: d.kategoriSampahId,
        namaKategori: d.kategoriSampah.namaKategori,
        jenis: d.kategoriSampah.jenis.toLowerCase(),
        hargaPerKg: d.kategoriSampah.hargaPerKg,
        poinPerKg: d.kategoriSampah.poinPerKg,
        beratKg: d.beratKg,
        beratKgReal: d.beratKgReal,
        subtotalPoin: d.subtotalPoin,
      })),
    };
  }

  async pengajuan(dto: CreateSetorSampahDto, nasabahId: string) {
    if (!nasabahId) {
      throw new BadRequestException('Profil nasabah tidak ditemukan untuk user ini.');
    }

    return this.prisma.$transaction(async (tx) => {
      const kategoriIds = Array.from(new Set(dto.items.map((i) => i.kategoriSampahId)));
      const existingKategoris = await tx.kategoriSampah.findMany({
        where: { id: { in: kategoriIds } },
      });

      const existingMap = new Map(existingKategoris.map((k) => [k.id, k]));
      for (const item of dto.items) {
        if (!existingMap.has(item.kategoriSampahId)) {
          throw new BadRequestException(
            `Kategori sampah dengan ID '${item.kategoriSampahId}' tidak ditemukan.`,
          );
        }
      }

      const submitDate = new Date(dto.tanggal);
      const year = submitDate.getUTCFullYear();
      const month = String(submitDate.getUTCMonth() + 1).padStart(2, '0');
      const yearMonth = `${year}${month}`;

      const startDate = new Date(Date.UTC(year, submitDate.getUTCMonth(), 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, submitDate.getUTCMonth() + 1, 1, 0, 0, 0));

      const count = await tx.setorSampah.count({
        where: {
          tanggal: { gte: startDate, lt: endDate },
        },
      });

      let nextNumber = count + 1;
      let kodeSetor = `STR-${yearMonth}-${String(nextNumber).padStart(4, '0')}`;

      let existingCode = await tx.setorSampah.findUnique({ where: { kodeSetor } });
      while (existingCode) {
        nextNumber++;
        kodeSetor = `STR-${yearMonth}-${String(nextNumber).padStart(4, '0')}`;
        existingCode = await tx.setorSampah.findUnique({ where: { kodeSetor } });
      }

      let totalBeratKg = 0;
      let totalPoin = 0;

      const detailData = dto.items.map((item) => {
        const kat = existingMap.get(item.kategoriSampahId)!;
        const subtotalPoin = Number((item.beratKg * kat.poinPerKg).toFixed(2));
        totalBeratKg += item.beratKg;
        totalPoin += subtotalPoin;

        return {
          kategoriSampahId: item.kategoriSampahId,
          beratKg: item.beratKg,
          subtotalPoin,
        };
      });

      totalBeratKg = Number(totalBeratKg.toFixed(2));
      totalPoin = Number(totalPoin.toFixed(2));

      const setorSampah = await tx.setorSampah.create({
        data: {
          kodeSetor,
          tanggal: submitDate,
          status: StatusSetor.MENUNGGU_KONFIRMASI,
          totalBeratKg,
          totalPoin,
          catatan: dto.catatan ?? null,
          nasabahId,
          detailSetor: {
            create: detailData,
          },
        },
        include: {
          detailSetor: {
            select: {
              kategoriSampahId: true,
              beratKg: true,
              subtotalPoin: true,
            },
          },
        },
      });

      return {
        id: setorSampah.id,
        kodeSetor: setorSampah.kodeSetor,
        tanggal: setorSampah.tanggal,
        status: setorSampah.status.toLowerCase(),
        totalBeratKg: setorSampah.totalBeratKg,
        estimasiTotalPoin: setorSampah.totalPoin,
        catatan: setorSampah.catatan,
        detailSetors: setorSampah.detailSetor,
      };
    });
  }

  async findMySetor(nasabahId: string, bulan?: string) {
    if (!nasabahId) {
      throw new BadRequestException('Profil nasabah tidak ditemukan untuk user ini.');
    }

    const whereClause: any = { nasabahId };

    if (bulan) {
      const { startDate, endDate } = parseMonthRange(bulan);
      whereClause.tanggal = {
        gte: startDate,
        lt: endDate,
      };
    }

    const list = await this.prisma.setorSampah.findMany({
      where: whereClause,
      orderBy: { tanggal: 'desc' },
      include: {
        detailSetor: {
          include: {
            kategoriSampah: {
              select: {
                namaKategori: true,
                jenis: true,
              },
            },
          },
        },
      },
    });

    return list.map((item) => ({
      id: item.id,
      kodeSetor: item.kodeSetor,
      tanggal: item.tanggal,
      status: item.status.toLowerCase(),
      totalBeratKg: item.totalBeratKg,
      totalPoin: item.totalPoin,
      catatan: item.catatan,
      catatanAdmin: item.catatanAdmin,
      detailSetors: item.detailSetor.map((d) => ({
        id: d.id,
        kategoriSampahId: d.kategoriSampahId,
        namaKategori: d.kategoriSampah.namaKategori,
        jenis: d.kategoriSampah.jenis.toLowerCase(),
        beratKg: d.beratKg,
        beratKgReal: d.beratKgReal,
        subtotalPoin: d.subtotalPoin,
      })),
    }));
  }
}


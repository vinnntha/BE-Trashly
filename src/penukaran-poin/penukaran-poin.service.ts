import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, StatusPenukaran } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStatusPenukaranDto } from './dto/update-status-penukaran.dto';
import { CreatePenukaranPoinDto } from './dto/create-penukaran-poin.dto';
import { parseMonthRange } from '../common/utils/date.util';

@Injectable()
export class PenukaranPoinService {
  constructor(private readonly prisma: PrismaService) {}

  async findAdminList(query: { bulan?: string }) {
    const whereClause: any = {};

    if (query.bulan) {
      const { startDate, endDate } = parseMonthRange(query.bulan);
      whereClause.tanggal = {
        gte: startDate,
        lt: endDate,
      };
    }

    const list = await this.prisma.penukaranPoin.findMany({
      where: whereClause,
      orderBy: { tanggal: 'desc' },
      select: {
        id: true,
        kodePenukaran: true,
        tanggal: true,
        poinTerpakai: true,
        status: true,
        nasabah: {
          select: {
            id: true,
            namaNasabah: true,
            telp: true,
          },
        },
        hadiah: {
          select: {
            id: true,
            namaHadiah: true,
            poinDibutuhkan: true,
          },
        },
      },
    });

    return list.map((item) => ({
      ...item,
      status: item.status.toLowerCase(),
    }));
  }

  async updateStatus(id: string, dto: UpdateStatusPenukaranDto) {
    const penukaran = await this.prisma.penukaranPoin.findUnique({
      where: { id },
    });

    if (!penukaran) {
      throw new NotFoundException(
        `Transaksi penukaran poin dengan ID '${id}' tidak ditemukan.`,
      );
    }

    if (penukaran.status === StatusPenukaran.SELESAI) {
      throw new BadRequestException(
        'Transaksi penukaran poin ini sudah selesai dan tidak dapat diubah lagi.',
      );
    }

    const targetStatus = dto.status.toUpperCase() as StatusPenukaran;

    const updated = await this.prisma.penukaranPoin.update({
      where: { id },
      data: {
        status: targetStatus,
      },
    });

    return {
      id: updated.id,
      kodePenukaran: updated.kodePenukaran,
      status: updated.status.toLowerCase(),
      updatedAt: updated.updatedAt,
    };
  }

  async findNota(id: string, user: { id: string; role: Role }) {
    const penukaran = await this.prisma.penukaranPoin.findUnique({
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
        hadiah: {
          select: {
            id: true,
            namaHadiah: true,
            poinDibutuhkan: true,
            foto: true,
          },
        },
      },
    });

    if (!penukaran) {
      throw new NotFoundException(
        `Nota penukaran poin dengan ID '${id}' tidak ditemukan.`,
      );
    }

    if (user.role === Role.NASABAH && penukaran.nasabah.userId !== user.id) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses untuk melihat nota penukaran poin ini.',
      );
    }

    return {
      id: penukaran.id,
      kodePenukaran: penukaran.kodePenukaran,
      tanggal: penukaran.tanggal,
      status: penukaran.status.toLowerCase(),
      poinTerpakai: penukaran.poinTerpakai,
      nasabah: {
        id: penukaran.nasabah.id,
        namaNasabah: penukaran.nasabah.namaNasabah,
        alamat: penukaran.nasabah.alamat,
        telp: penukaran.nasabah.telp,
      },
      hadiah: {
        id: penukaran.hadiah.id,
        namaHadiah: penukaran.hadiah.namaHadiah,
        poinDibutuhkan: penukaran.hadiah.poinDibutuhkan,
        foto: penukaran.hadiah.foto,
      },
    };
  }

  async tukar(dto: CreatePenukaranPoinDto, nasabahId: string) {
    if (!nasabahId) {
      throw new BadRequestException('Profil nasabah tidak ditemukan untuk user ini.');
    }

    return this.prisma.$transaction(async (tx) => {
      const hadiah = await tx.hadiah.findUnique({
        where: { id: dto.hadiahId },
      });

      if (!hadiah) {
        throw new NotFoundException('Hadiah tidak ditemukan.');
      }

      if (hadiah.stok <= 0) {
        throw new BadRequestException('Stok hadiah ini sudah habis.');
      }

      const nasabah = await tx.nasabah.findUnique({
        where: { id: nasabahId },
      });

      if (!nasabah) {
        throw new NotFoundException('Data nasabah tidak ditemukan.');
      }

      if (nasabah.saldoPoin < hadiah.poinDibutuhkan) {
        throw new BadRequestException(
          `Saldo poin Anda (${nasabah.saldoPoin} poin) tidak mencukupi untuk menukar hadiah ini (${hadiah.poinDibutuhkan} poin).`,
        );
      }

      const now = new Date();
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const yearMonth = `${year}${month}`;

      const startDate = new Date(Date.UTC(year, now.getUTCMonth(), 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, now.getUTCMonth() + 1, 1, 0, 0, 0));

      const count = await tx.penukaranPoin.count({
        where: {
          tanggal: { gte: startDate, lt: endDate },
        },
      });

      let nextNumber = count + 1;
      let kodePenukaran = `TKR-${yearMonth}-${String(nextNumber).padStart(4, '0')}`;

      let existingCode = await tx.penukaranPoin.findUnique({
        where: { kodePenukaran },
      });
      while (existingCode) {
        nextNumber++;
        kodePenukaran = `TKR-${yearMonth}-${String(nextNumber).padStart(4, '0')}`;
        existingCode = await tx.penukaranPoin.findUnique({
          where: { kodePenukaran },
        });
      }

      const updatedNasabah = await tx.nasabah.update({
        where: { id: nasabahId },
        data: {
          saldoPoin: {
            decrement: hadiah.poinDibutuhkan,
          },
        },
      });

      await tx.hadiah.update({
        where: { id: hadiah.id },
        data: {
          stok: {
            decrement: 1,
          },
        },
      });

      const penukaran = await tx.penukaranPoin.create({
        data: {
          kodePenukaran,
          tanggal: now,
          nasabahId,
          hadiahId: hadiah.id,
          poinTerpakai: hadiah.poinDibutuhkan,
          status: StatusPenukaran.DIPROSES,
        },
        include: {
          hadiah: {
            select: {
              namaHadiah: true,
            },
          },
        },
      });

      return {
        id: penukaran.id,
        kodePenukaran: penukaran.kodePenukaran,
        tanggal: penukaran.tanggal,
        hadiahId: penukaran.hadiahId,
        poinTerpakai: penukaran.poinTerpakai,
        sisaSaldoPoin: updatedNasabah.saldoPoin,
        status: penukaran.status.toLowerCase(),
        hadiah: {
          namaHadiah: penukaran.hadiah.namaHadiah,
        },
      };
    });
  }

  async findMyPenukaran(nasabahId: string) {
    if (!nasabahId) {
      throw new BadRequestException('Profil nasabah tidak ditemukan untuk user ini.');
    }

    const list = await this.prisma.penukaranPoin.findMany({
      where: { nasabahId },
      orderBy: { tanggal: 'desc' },
      include: {
        hadiah: {
          select: {
            id: true,
            namaHadiah: true,
            poinDibutuhkan: true,
            foto: true,
          },
        },
      },
    });

    return list.map((item) => ({
      id: item.id,
      kodePenukaran: item.kodePenukaran,
      tanggal: item.tanggal,
      poinTerpakai: item.poinTerpakai,
      status: item.status.toLowerCase(),
      hadiah: item.hadiah,
    }));
  }
}


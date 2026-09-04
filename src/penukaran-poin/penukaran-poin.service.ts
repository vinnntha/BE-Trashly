import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, StatusPenukaran } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStatusPenukaranDto } from './dto/update-status-penukaran.dto';
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
}

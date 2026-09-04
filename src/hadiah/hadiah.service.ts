import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusPenukaran } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHadiahDto } from './dto/create-hadiah.dto';
import { UpdateHadiahDto } from './dto/update-hadiah.dto';

@Injectable()
export class HadiahService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.hadiah.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const hadiah = await this.prisma.hadiah.findUnique({
      where: { id },
    });

    if (!hadiah) {
      throw new NotFoundException(`Hadiah dengan ID '${id}' tidak ditemukan.`);
    }

    return hadiah;
  }

  async create(dto: CreateHadiahDto, file?: Express.Multer.File) {
    const photoPath = file ? `/uploads/hadiah/${file.filename}` : null;

    return this.prisma.hadiah.create({
      data: {
        namaHadiah: dto.namaHadiah,
        poinDibutuhkan: dto.poinDibutuhkan,
        stok: dto.stok,
        foto: photoPath,
      },
    });
  }

  async update(id: string, dto: UpdateHadiahDto, file?: Express.Multer.File) {
    const existing = await this.prisma.hadiah.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Hadiah dengan ID '${id}' tidak ditemukan.`);
    }

    const photoPath = file ? `/uploads/hadiah/${file.filename}` : undefined;

    return this.prisma.hadiah.update({
      where: { id },
      data: {
        ...(dto.namaHadiah !== undefined && { namaHadiah: dto.namaHadiah }),
        ...(dto.poinDibutuhkan !== undefined && {
          poinDibutuhkan: dto.poinDibutuhkan,
        }),
        ...(dto.stok !== undefined && { stok: dto.stok }),
        ...(photoPath !== undefined && { foto: photoPath }),
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.hadiah.findUnique({
      where: { id },
      include: {
        penukaranPoin: {
          where: {
            status: StatusPenukaran.DIPROSES,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Hadiah dengan ID '${id}' tidak ditemukan.`);
    }

    if (existing.penukaranPoin.length > 0) {
      throw new BadRequestException(
        'Hadiah tidak dapat dihapus karena masih ada transaksi penukaran poin yang sedang diproses.',
      );
    }

    try {
      await this.prisma.hadiah.delete({
        where: { id },
      });
      return { message: 'Hadiah berhasil dihapus.' };
    } catch (error: any) {
      if (error?.code === 'P2003') {
        throw new BadRequestException(
          'Hadiah tidak dapat dihapus karena sudah tercatat dalam riwayat penukaran poin sebelumnya.',
        );
      }
      throw error;
    }
  }
}

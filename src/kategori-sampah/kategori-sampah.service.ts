import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKategoriSampahDto } from './dto/create-kategori-sampah.dto';
import { UpdateKategoriSampahDto } from './dto/update-kategori-sampah.dto';

@Injectable()
export class KategoriSampahService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.kategoriSampah.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const kategori = await this.prisma.kategoriSampah.findUnique({
      where: { id },
    });

    if (!kategori) {
      throw new NotFoundException(
        `Kategori sampah dengan ID '${id}' tidak ditemukan.`,
      );
    }

    return kategori;
  }

  async create(dto: CreateKategoriSampahDto, file?: Express.Multer.File) {
    const photoPath = file ? `/uploads/kategori/${file.filename}` : null;

    return this.prisma.kategoriSampah.create({
      data: {
        namaKategori: dto.namaKategori,
        hargaPerKg: dto.hargaPerKg,
        poinPerKg: dto.poinPerKg,
        jenis: dto.jenis,
        foto: photoPath,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateKategoriSampahDto,
    file?: Express.Multer.File,
  ) {
    const existing = await this.prisma.kategoriSampah.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        `Kategori sampah dengan ID '${id}' tidak ditemukan.`,
      );
    }

    const photoPath = file ? `/uploads/kategori/${file.filename}` : undefined;

    return this.prisma.kategoriSampah.update({
      where: { id },
      data: {
        ...(dto.namaKategori !== undefined && {
          namaKategori: dto.namaKategori,
        }),
        ...(dto.hargaPerKg !== undefined && { hargaPerKg: dto.hargaPerKg }),
        ...(dto.poinPerKg !== undefined && { poinPerKg: dto.poinPerKg }),
        ...(dto.jenis !== undefined && { jenis: dto.jenis }),
        ...(photoPath !== undefined && { foto: photoPath }),
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.kategoriSampah.findUnique({
      where: { id },
      include: {
        detailSetor: {
          take: 1,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Kategori sampah dengan ID '${id}' tidak ditemukan.`,
      );
    }

    if (existing.detailSetor.length > 0) {
      throw new BadRequestException(
        'Kategori sampah tidak dapat dihapus karena masih tercatat dalam riwayat transaksi setoran.',
      );
    }

    await this.prisma.kategoriSampah.delete({
      where: { id },
    });

    return { message: 'Kategori sampah berhasil dihapus.' };
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, StatusPenukaran, StatusSetor } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNasabahDto } from './dto/create-nasabah.dto';
import { UpdateNasabahDto } from './dto/update-nasabah.dto';

@Injectable()
export class NasabahService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.nasabah.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!nasabah) {
      throw new NotFoundException(`Nasabah dengan ID '${id}' tidak ditemukan.`);
    }

    return nasabah;
  }

  async create(dto: CreateNasabahDto, file?: Express.Multer.File) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existingUser) {
      throw new BadRequestException('Username sudah digunakan.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const photoPath = file ? `/uploads/nasabah/${file.filename}` : null;

    const user = await this.prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          username: dto.username,
          password: hashedPassword,
          role: Role.NASABAH,
          nasabah: {
            create: {
              namaNasabah: dto.namaNasabah,
              alamat: dto.alamat,
              telp: dto.telp,
              saldoPoin: 0,
              foto: photoPath,
            },
          },
        },
        include: {
          nasabah: true,
        },
      });
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getProfile(nasabahId: string) {
    if (!nasabahId) {
      throw new BadRequestException('Profil nasabah tidak ditemukan untuk akun ini.');
    }

    const nasabah = await this.prisma.nasabah.findUnique({
      where: { id: nasabahId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!nasabah) {
      throw new NotFoundException('Data nasabah tidak ditemukan.');
    }

    return nasabah;
  }

  async update(id: string, dto: UpdateNasabahDto, file?: Express.Multer.File) {
    if (!id) {
      throw new BadRequestException('ID Nasabah tidak valid atau belum terdaftar.');
    }

    const existing = await this.prisma.nasabah.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Nasabah dengan ID '${id}' tidak ditemukan.`);
    }

    const namaNasabah = dto.namaNasabah ?? dto.namaLengkap;
    const telp = dto.telp ?? dto.noTelepon;
    const photoPath = file ? `/uploads/nasabah/${file.filename}` : undefined;

    return this.prisma.nasabah.update({
      where: { id },
      data: {
        ...(namaNasabah !== undefined && { namaNasabah }),
        ...(telp !== undefined && { telp }),
        ...(dto.alamat !== undefined && { alamat: dto.alamat }),
        ...(photoPath !== undefined && { foto: photoPath }),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: { id },
      include: {
        setorSampah: {
          where: {
            status: {
              in: [StatusSetor.MENUNGGU_KONFIRMASI, StatusSetor.DIVERIFIKASI],
            },
          },
        },
        penukaranPoin: {
          where: {
            status: StatusPenukaran.DIPROSES,
          },
        },
      },
    });

    if (!nasabah) {
      throw new NotFoundException(`Nasabah dengan ID '${id}' tidak ditemukan.`);
    }

    if (nasabah.setorSampah.length > 0) {
      throw new BadRequestException(
        'Tidak dapat menghapus nasabah: nasabah masih memiliki transaksi setoran berstatus menunggu konfirmasi atau diverifikasi.',
      );
    }

    if (nasabah.penukaranPoin.length > 0) {
      throw new BadRequestException(
        'Tidak dapat menghapus nasabah: nasabah masih memiliki transaksi penukaran poin berstatus diproses.',
      );
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.user.delete({
          where: { id: nasabah.userId },
        });
      });
      return { message: 'Nasabah berhasil dihapus.' };
    } catch (error: any) {
      if (error?.code === 'P2003') {
        throw new BadRequestException(
          'Tidak dapat menghapus nasabah: data nasabah memiliki riwayat transaksi selesai/ditolak yang tersimpan dalam sistem audit.',
        );
      }
      throw error;
    }
  }
}

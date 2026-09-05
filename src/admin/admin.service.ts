import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(
    userId: string,
    dto: UpdateAdminProfileDto,
    _file?: Express.Multer.File,
  ) {
    const adminBank = await this.prisma.adminBank.findUnique({
      where: { userId },
    });

    if (!adminBank) {
      throw new NotFoundException('Profil unit bank sampah tidak ditemukan.');
    }

    const updated = await this.prisma.adminBank.update({
      where: { userId },
      data: {
        ...(dto.namaUnit !== undefined && { namaUnit: dto.namaUnit }),
        ...(dto.namaPengelola !== undefined && { namaPengelola: dto.namaPengelola }),
        ...(dto.telp !== undefined && { telp: dto.telp }),
      },
    });

    return updated;
  }
}

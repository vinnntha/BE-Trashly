import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterNasabahDto } from './dto/register-nasabah.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerNasabah(
    dto: RegisterNasabahDto,
    file?: Express.Multer.File,
  ) {
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

  async registerAdmin(dto: RegisterAdminDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existingUser) {
      throw new BadRequestException('Username sudah digunakan.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          username: dto.username,
          password: hashedPassword,
          role: Role.ADMIN,
          adminBank: {
            create: {
              namaUnit: dto.namaUnit,
              namaPengelola: dto.namaPengelola,
              telp: dto.telp,
            },
          },
        },
        include: {
          adminBank: true,
        },
      });
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        nasabah: true,
        adminBank: true,
      },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      nasabah: user.nasabah || null,
      adminBank: user.adminBank || null,
      token,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        nasabah: true,
        adminBank: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    const { password: _, ...userWithoutPassword } = user;
    return {
      id: userWithoutPassword.id,
      username: userWithoutPassword.username,
      role: userWithoutPassword.role,
      nasabah: userWithoutPassword.nasabah || null,
      adminBank: userWithoutPassword.adminBank || null,
    };
  }
}

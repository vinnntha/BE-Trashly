import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  username: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'trashly_jwt_secret',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        nasabah: { select: { id: true } },
        adminBank: { select: { id: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Sesi tidak valid atau pengguna telah dihapus.');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      nasabahId: user.nasabah?.id ?? null,
      adminId: user.adminBank?.id ?? null,
    };
  }
}


import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RekapitulasiService } from './rekapitulasi.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('rekapitulasi')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class RekapitulasiController {
  constructor(private readonly rekapitulasiService: RekapitulasiService) {}

  @Get('bulanan')
  @HttpCode(HttpStatus.OK)
  async getRekapitulasiBulanan(@Query('bulan') bulan?: string) {
    const data = await this.rekapitulasiService.getRekapitulasiBulanan(bulan);
    return {
      message: 'Rekapitulasi bulanan berhasil diambil.',
      data,
    };
  }
}

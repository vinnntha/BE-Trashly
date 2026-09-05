import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    const data = await this.dashboardService.getStats();
    return {
      message: 'Statistik dashboard berhasil diambil.',
      data,
    };
  }

  @Get('summary')
  @Roles('NASABAH')
  @HttpCode(HttpStatus.OK)
  async getSummary(@Req() req: any) {
    const data = await this.dashboardService.getSummary(req.user.nasabahId);
    return {
      message: 'Ringkasan dashboard nasabah berhasil diambil.',
      data,
    };
  }
}

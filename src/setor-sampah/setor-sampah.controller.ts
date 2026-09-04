import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SetorSampahService } from './setor-sampah.service';
import { VerifySetorSampahDto } from './dto/verify-setor-sampah.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('setor-sampah')
export class SetorSampahController {
  constructor(private readonly setorSampahService: SetorSampahService) {}

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async findAdminList(
    @Query('status') status?: string,
    @Query('bulan') bulan?: string,
  ) {
    const data = await this.setorSampahService.findAdminList({ status, bulan });
    return {
      message: 'Daftar pengajuan setoran sampah berhasil diambil.',
      data,
    };
  }

  @Put('admin/verify/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async verify(
    @Param('id') id: string,
    @Body() dto: VerifySetorSampahDto,
    @Req() req: any,
  ) {
    const data = await this.setorSampahService.verify(id, dto, req.user.id);
    return {
      message: 'Status dan penimbangan setoran sampah berhasil diverifikasi.',
      data,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string, @Req() req: any) {
    const data = await this.setorSampahService.findOne(id, req.user);
    return {
      message: 'Detail struk setoran sampah berhasil diambil.',
      data,
    };
  }
}

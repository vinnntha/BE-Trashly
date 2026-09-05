import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PenukaranPoinService } from './penukaran-poin.service';
import { UpdateStatusPenukaranDto } from './dto/update-status-penukaran.dto';
import { CreatePenukaranPoinDto } from './dto/create-penukaran-poin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('penukaran-poin')
export class PenukaranPoinController {
  constructor(private readonly penukaranPoinService: PenukaranPoinService) {}

  @Post('tukar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NASABAH')
  @HttpCode(HttpStatus.CREATED)
  async tukar(@Body() dto: CreatePenukaranPoinDto, @Req() req: any) {
    const data = await this.penukaranPoinService.tukar(dto, req.user.nasabahId);
    return {
      message: 'Penukaran poin berhasil diproses.',
      data,
    };
  }

  @Get('my-penukaran')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NASABAH')
  @HttpCode(HttpStatus.OK)
  async findMyPenukaran(@Req() req: any) {
    const data = await this.penukaranPoinService.findMyPenukaran(
      req.user.nasabahId,
    );
    return {
      message: 'Histori penukaran poin berhasil diambil.',
      data,
    };
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async findAdminList(@Query('bulan') bulan?: string) {
    const data = await this.penukaranPoinService.findAdminList({ bulan });
    return {
      message: 'Daftar penukaran poin berhasil diambil.',
      data,
    };
  }

  @Put('admin/status/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusPenukaranDto,
  ) {
    const data = await this.penukaranPoinService.updateStatus(id, dto);
    return {
      message: 'Status penukaran poin berhasil diperbarui.',
      data,
    };
  }

  @Get('nota/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findNota(@Param('id') id: string, @Req() req: any) {
    const data = await this.penukaranPoinService.findNota(id, req.user);
    return {
      message: 'Detail nota penukaran poin berhasil diambil.',
      data,
    };
  }
}

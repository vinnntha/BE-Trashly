import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NasabahService } from './nasabah.service';
import { UpdateNasabahDto } from './dto/update-nasabah.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { nasabahUploadOptions } from '../common/multer/multer.config';

@Controller('nasabah')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('NASABAH')
export class NasabahProfileController {
  constructor(private readonly nasabahService: NasabahService) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req: any) {
    const data = await this.nasabahService.getProfile(req.user.nasabahId);
    return {
      message: 'Profil nasabah berhasil diambil.',
      data,
    };
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('foto', nasabahUploadOptions))
  async updateProfile(
    @Req() req: any,
    @Body() dto: UpdateNasabahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.nasabahService.update(
      req.user.nasabahId,
      dto,
      file,
    );
    return {
      message: 'Profil nasabah berhasil diperbarui.',
      data,
    };
  }
}

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { adminUploadOptions } from '../common/multer/multer.config';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('foto', adminUploadOptions))
  async updateProfile(
    @Req() req: any,
    @Body() dto: UpdateAdminProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.adminService.updateProfile(req.user.id, dto, file);
    return {
      message: 'Profil unit bank sampah berhasil diperbarui.',
      data,
    };
  }
}

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Req() req: any, @Body() dto: UpdateAdminProfileDto) {
    const data = await this.adminService.updateProfile(req.user.id, dto);
    return {
      message: 'Profil unit bank sampah berhasil diperbarui.',
      data,
    };
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterNasabahDto } from './dto/register-nasabah.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { nasabahUploadOptions } from '../common/multer/multer.config';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('nasabah/register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('foto', nasabahUploadOptions))
  async registerNasabah(
    @Body() dto: RegisterNasabahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.authService.registerNasabah(dto, file);
    return {
      message: 'Registrasi nasabah berhasil.',
      data,
    };
  }

  @Post('admin/register')
  @HttpCode(HttpStatus.CREATED)
  async registerAdmin(@Body() dto: RegisterAdminDto) {
    const data = await this.authService.registerAdmin(dto);
    return {
      message: 'Registrasi admin berhasil.',
      data,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: any, @Body() _loginDto: LoginDto) {
    const data = await this.authService.login(req.user);
    return {
      message: 'Login berhasil.',
      data,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    const data = await this.authService.getMe(req.user.id);
    return {
      message: 'Data pengguna berhasil diambil.',
      data,
    };
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HadiahService } from './hadiah.service';
import { CreateHadiahDto } from './dto/create-hadiah.dto';
import { UpdateHadiahDto } from './dto/update-hadiah.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { hadiahUploadOptions } from '../common/multer/multer.config';

@Controller('hadiah')
export class HadiahController {
  constructor(private readonly hadiahService: HadiahService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const data = await this.hadiahService.findAll();
    return {
      message: 'Daftar hadiah berhasil diambil.',
      data,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('foto', hadiahUploadOptions))
  async create(
    @Body() dto: CreateHadiahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.hadiahService.create(dto, file);
    return {
      message: 'Hadiah berhasil ditambahkan.',
      data,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const data = await this.hadiahService.findOne(id);
    return {
      message: 'Detail hadiah berhasil diambil.',
      data,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('foto', hadiahUploadOptions))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateHadiahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.hadiahService.update(id, dto, file);
    return {
      message: 'Hadiah berhasil diperbarui.',
      data,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.hadiahService.remove(id);
  }
}

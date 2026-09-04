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
import { KategoriSampahService } from './kategori-sampah.service';
import { CreateKategoriSampahDto } from './dto/create-kategori-sampah.dto';
import { UpdateKategoriSampahDto } from './dto/update-kategori-sampah.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { kategoriUploadOptions } from '../common/multer/multer.config';

@Controller('kategori-sampah')
export class KategoriSampahController {
  constructor(private readonly kategoriSampahService: KategoriSampahService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const data = await this.kategoriSampahService.findAll();
    return {
      message: 'Daftar kategori sampah berhasil diambil.',
      data,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('foto', kategoriUploadOptions))
  async create(
    @Body() dto: CreateKategoriSampahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.kategoriSampahService.create(dto, file);
    return {
      message: 'Kategori sampah berhasil ditambahkan.',
      data,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const data = await this.kategoriSampahService.findOne(id);
    return {
      message: 'Detail kategori sampah berhasil diambil.',
      data,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('foto', kategoriUploadOptions))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateKategoriSampahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.kategoriSampahService.update(id, dto, file);
    return {
      message: 'Kategori sampah berhasil diperbarui.',
      data,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.kategoriSampahService.remove(id);
  }
}

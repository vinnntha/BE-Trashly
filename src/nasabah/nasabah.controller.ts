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
import { NasabahService } from './nasabah.service';
import { CreateNasabahDto } from './dto/create-nasabah.dto';
import { UpdateNasabahDto } from './dto/update-nasabah.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { nasabahUploadOptions } from '../common/multer/multer.config';

@Controller('admin/nasabah')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class NasabahController {
  constructor(private readonly nasabahService: NasabahService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const data = await this.nasabahService.findAll();
    return {
      message: 'Daftar nasabah berhasil diambil.',
      data,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('foto', nasabahUploadOptions))
  async create(
    @Body() dto: CreateNasabahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.nasabahService.create(dto, file);
    return {
      message: 'Nasabah baru berhasil ditambahkan.',
      data,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const data = await this.nasabahService.findOne(id);
    return {
      message: 'Detail nasabah berhasil diambil.',
      data,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('foto', nasabahUploadOptions))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNasabahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.nasabahService.update(id, dto, file);
    return {
      message: 'Data nasabah berhasil diperbarui.',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.nasabahService.remove(id);
  }
}

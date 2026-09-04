import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { JenisKategori } from '@prisma/client';

export class UpdateKategoriSampahDto {
  @IsOptional()
  @IsString({ message: 'Nama kategori harus berupa string' })
  namaKategori?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Harga per kg harus berupa angka' })
  @IsPositive({ message: 'Harga per kg harus lebih besar dari 0' })
  hargaPerKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Poin per kg harus berupa angka' })
  @IsPositive({ message: 'Poin per kg harus lebih besar dari 0' })
  poinPerKg?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(JenisKategori, {
    message: 'Jenis kategori harus salah satu dari: plastik, kertas, logam, kaca',
  })
  jenis?: JenisKategori;
}

import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { JenisKategori } from '@prisma/client';

export class CreateKategoriSampahDto {
  @IsNotEmpty({ message: 'Nama kategori wajib diisi' })
  @IsString({ message: 'Nama kategori harus berupa string' })
  namaKategori: string;

  @IsNotEmpty({ message: 'Harga per kg wajib diisi' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Harga per kg harus berupa angka' })
  @IsPositive({ message: 'Harga per kg harus lebih besar dari 0' })
  hargaPerKg: number;

  @IsNotEmpty({ message: 'Poin per kg wajib diisi' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Poin per kg harus berupa angka' })
  @IsPositive({ message: 'Poin per kg harus lebih besar dari 0' })
  poinPerKg: number;

  @IsNotEmpty({ message: 'Jenis kategori wajib diisi' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(JenisKategori, {
    message: 'Jenis kategori harus salah satu dari: plastik, kertas, logam, kaca',
  })
  jenis: JenisKategori;

  @IsOptional()
  foto?: any;
}

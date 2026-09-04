import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHadiahDto {
  @IsNotEmpty({ message: 'Nama hadiah wajib diisi' })
  @IsString({ message: 'Nama hadiah harus berupa string' })
  namaHadiah: string;

  @IsNotEmpty({ message: 'Poin dibutuhkan wajib diisi' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Poin dibutuhkan harus berupa angka' })
  @IsPositive({ message: 'Poin dibutuhkan harus lebih besar dari 0' })
  poinDibutuhkan: number;

  @IsNotEmpty({ message: 'Stok wajib diisi' })
  @Type(() => Number)
  @IsInt({ message: 'Stok harus berupa bilangan bulat' })
  @Min(0, { message: 'Stok minimal 0' })
  stok: number;
}

import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateHadiahDto {
  @IsOptional()
  @IsString({ message: 'Nama hadiah harus berupa string' })
  namaHadiah?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Poin dibutuhkan harus berupa angka' })
  @IsPositive({ message: 'Poin dibutuhkan harus lebih besar dari 0' })
  poinDibutuhkan?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Stok harus berupa bilangan bulat' })
  @Min(0, { message: 'Stok minimal 0' })
  stok?: number;
}

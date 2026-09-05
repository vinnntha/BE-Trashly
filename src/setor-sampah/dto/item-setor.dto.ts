import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemSetorDto {
  @IsNotEmpty({ message: 'kategoriSampahId wajib diisi' })
  @IsUUID('all', { message: 'kategoriSampahId harus berupa UUID valid' })
  kategoriSampahId: string;

  @IsNotEmpty({ message: 'beratKg wajib diisi' })
  @Type(() => Number)
  @IsNumber({}, { message: 'beratKg harus berupa angka' })
  @IsPositive({ message: 'beratKg harus lebih besar dari 0' })
  beratKg: number;
}

import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ItemRealDto {
  @IsNotEmpty({ message: 'kategoriSampahId wajib diisi' })
  @IsUUID('all', { message: 'kategoriSampahId harus berupa UUID valid' })
  kategoriSampahId: string;

  @IsNotEmpty({ message: 'beratKgReal wajib diisi' })
  @Type(() => Number)
  @IsNumber({}, { message: 'beratKgReal harus berupa angka' })
  @IsPositive({ message: 'beratKgReal harus lebih besar dari 0' })
  beratKgReal: number;
}

export class VerifySetorSampahDto {
  @IsNotEmpty({ message: 'status wajib diisi' })
  @IsIn(['diverifikasi', 'ditolak', 'selesai', 'DIVERIFIKASI', 'DITOLAK', 'SELESAI'], {
    message:
      'status harus salah satu dari: diverifikasi, ditolak, atau selesai',
  })
  status: string;

  @IsNotEmpty({ message: 'catatanAdmin wajib diisi' })
  @IsString({ message: 'catatanAdmin harus berupa string' })
  catatanAdmin: string;

  @IsOptional()
  @IsArray({ message: 'itemsReal harus berupa array' })
  @ValidateNested({ each: true })
  @Type(() => ItemRealDto)
  itemsReal?: ItemRealDto[];
}

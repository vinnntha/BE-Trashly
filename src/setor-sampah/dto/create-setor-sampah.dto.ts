import {
  ArrayMinSize,
  IsArray,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemSetorDto } from './item-setor.dto';

export class CreateSetorSampahDto {
  @IsNotEmpty({ message: 'tanggal wajib diisi' })
  @IsISO8601({}, { message: 'Format tanggal harus berupa ISO8601 (contoh: 2026-09-05T08:00:00Z)' })
  tanggal: string;

  @IsOptional()
  @IsString({ message: 'catatan harus berupa string' })
  catatan?: string;

  @IsNotEmpty({ message: 'items wajib diisi' })
  @IsArray({ message: 'items harus berupa array' })
  @ArrayMinSize(1, { message: 'items minimal harus berisi 1 jenis sampah' })
  @ValidateNested({ each: true })
  @Type(() => ItemSetorDto)
  items: ItemSetorDto[];
}

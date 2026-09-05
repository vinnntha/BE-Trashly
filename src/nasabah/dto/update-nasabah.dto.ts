import { IsOptional, IsString } from 'class-validator';

export class UpdateNasabahDto {
  @IsOptional()
  @IsString({ message: 'Nama nasabah harus berupa string' })
  namaNasabah?: string;

  @IsOptional()
  @IsString({ message: 'Nama lengkap harus berupa string' })
  namaLengkap?: string;

  @IsOptional()
  @IsString({ message: 'Nomor telepon harus berupa string' })
  telp?: string;

  @IsOptional()
  @IsString({ message: 'Nomor telepon harus berupa string' })
  noTelepon?: string;

  @IsOptional()
  @IsString({ message: 'Alamat harus berupa string' })
  alamat?: string;

  @IsOptional()
  foto?: any;

  // Catatan: saldoPoin sengaja tidak didefinisikan agar tidak dapat diubah dari endpoint ini
}

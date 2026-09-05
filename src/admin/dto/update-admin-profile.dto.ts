import { IsOptional, IsString } from 'class-validator';

export class UpdateAdminProfileDto {
  @IsOptional()
  @IsString({ message: 'Nama unit harus berupa string' })
  namaUnit?: string;

  @IsOptional()
  @IsString({ message: 'Nama pengelola harus berupa string' })
  namaPengelola?: string;

  @IsOptional()
  @IsString({ message: 'Nomor telepon harus berupa string' })
  telp?: string;

  @IsOptional()
  foto?: any;
}

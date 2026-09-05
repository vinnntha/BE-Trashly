import { IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterNasabahDto {
  @IsString()
  @MinLength(4, { message: 'Username minimal 4 karakter' })
  username!: string;

  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama nasabah tidak boleh kosong' })
  namaNasabah!: string;

  @IsString()
  @IsNotEmpty({ message: 'Alamat tidak boleh kosong' })
  alamat!: string;

  @IsString()
  @Matches(/^[0-9+]+$/, {
    message: 'Nomor telepon hanya boleh berisi angka dan tanda +',
  })
  telp!: string;

  @IsOptional()
  foto?: any;
}

import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateNasabahDto {
  @IsNotEmpty({ message: 'Username wajib diisi' })
  @IsString({ message: 'Username harus berupa string' })
  username: string;

  @IsNotEmpty({ message: 'Password wajib diisi' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @IsNotEmpty({ message: 'Nama nasabah wajib diisi' })
  @IsString({ message: 'Nama nasabah harus berupa string' })
  namaNasabah: string;

  @IsNotEmpty({ message: 'Alamat wajib diisi' })
  @IsString({ message: 'Alamat harus berupa string' })
  alamat: string;

  @IsNotEmpty({ message: 'Nomor telepon wajib diisi' })
  @IsString({ message: 'Nomor telepon harus berupa string' })
  telp: string;
}

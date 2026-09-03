import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterAdminDto {
  @IsString()
  @MinLength(4, { message: 'Username minimal 4 karakter' })
  username!: string;

  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama unit tidak boleh kosong' })
  namaUnit!: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama pengelola tidak boleh kosong' })
  namaPengelola!: string;

  @IsString()
  @Matches(/^[0-9+]+$/, {
    message: 'Nomor telepon hanya boleh berisi angka dan tanda +',
  })
  telp!: string;
}

import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateStatusPenukaranDto {
  @IsNotEmpty({ message: 'status wajib diisi' })
  @IsIn(['diproses', 'selesai', 'DIPROSES', 'SELESAI'], {
    message: 'status harus berupa: diproses atau selesai',
  })
  status: string;
}

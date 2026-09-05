import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePenukaranPoinDto {
  @IsNotEmpty({ message: 'hadiahId wajib diisi' })
  @IsUUID('all', { message: 'hadiahId harus berupa UUID valid' })
  hadiahId: string;
}

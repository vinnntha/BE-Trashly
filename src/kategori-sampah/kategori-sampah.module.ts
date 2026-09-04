import { Module } from '@nestjs/common';
import { KategoriSampahController } from './kategori-sampah.controller';
import { KategoriSampahService } from './kategori-sampah.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KategoriSampahController],
  providers: [KategoriSampahService],
  exports: [KategoriSampahService],
})
export class KategoriSampahModule {}

import { Module } from '@nestjs/common';
import { RekapitulasiController } from './rekapitulasi.controller';
import { RekapitulasiService } from './rekapitulasi.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RekapitulasiController],
  providers: [RekapitulasiService],
  exports: [RekapitulasiService],
})
export class RekapitulasiModule {}

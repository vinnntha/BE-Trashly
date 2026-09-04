import { Module } from '@nestjs/common';
import { SetorSampahController } from './setor-sampah.controller';
import { SetorSampahService } from './setor-sampah.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SetorSampahController],
  providers: [SetorSampahService],
  exports: [SetorSampahService],
})
export class SetorSampahModule {}

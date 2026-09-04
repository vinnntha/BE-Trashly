import { Module } from '@nestjs/common';
import { HadiahController } from './hadiah.controller';
import { HadiahService } from './hadiah.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HadiahController],
  providers: [HadiahService],
  exports: [HadiahService],
})
export class HadiahModule {}

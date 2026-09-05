import { Module } from '@nestjs/common';
import { NasabahController } from './nasabah.controller';
import { NasabahProfileController } from './nasabah-profile.controller';
import { NasabahService } from './nasabah.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NasabahController, NasabahProfileController],
  providers: [NasabahService],
  exports: [NasabahService],
})
export class NasabahModule {}

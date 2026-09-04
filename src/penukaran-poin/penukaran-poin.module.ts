import { Module } from '@nestjs/common';
import { PenukaranPoinController } from './penukaran-poin.controller';
import { PenukaranPoinService } from './penukaran-poin.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PenukaranPoinController],
  providers: [PenukaranPoinService],
  exports: [PenukaranPoinService],
})
export class PenukaranPoinModule {}

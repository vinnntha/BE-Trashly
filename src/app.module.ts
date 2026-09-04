import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { NasabahModule } from './nasabah/nasabah.module';
import { KategoriSampahModule } from './kategori-sampah/kategori-sampah.module';
import { HadiahModule } from './hadiah/hadiah.module';
import { SetorSampahModule } from './setor-sampah/setor-sampah.module';
import { PenukaranPoinModule } from './penukaran-poin/penukaran-poin.module';
import { RekapitulasiModule } from './rekapitulasi/rekapitulasi.module';
import { DashboardModule } from './dashboard/dashboard.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdminModule,
    NasabahModule,
    KategoriSampahModule,
    HadiahModule,
    SetorSampahModule,
    PenukaranPoinModule,
    RekapitulasiModule,
    DashboardModule,
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

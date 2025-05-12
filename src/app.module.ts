import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/app-config/app-config.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [PaymentModule, AppConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

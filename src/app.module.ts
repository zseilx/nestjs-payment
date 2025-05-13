import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/app-config/app-config.module';
import { PrismaModule } from './config/prisma/prisma.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [AppConfigModule, OrderModule, PaymentModule, PrismaModule, ProductModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/app-config/app-config.module';
import { ValidationException } from './config/exception/exceptions';
import { PrismaModule } from './config/prisma/prisma.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    AppConfigModule,
    OrderModule,
    PaymentModule,
    PrismaModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useFactory: () => {
        return new ValidationPipe({
          transform: true,
          whitelist: true, // dto에 없는 속성은 무시
          exceptionFactory: (errors) => new ValidationException(errors),
        });
      },
    },
  ],
})
export class AppModule {}

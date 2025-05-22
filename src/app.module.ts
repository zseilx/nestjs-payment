import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/app-config/app-config.module';
import { ValidationException } from './config/exception/exceptions';
import { LoggingMiddleware } from './config/logging.middleware';
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggingMiddleware)
      .exclude('health/liveness', 'health/readiness')
      .forRoutes('*'); // 모든 라우트에 대해 로깅 미들웨어 적용
  }
}

import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { OrderModule } from 'src/order/order.module';
import { PayletterService } from './payletter/payletter.service';
import { PaymentServiceFactory } from './payment-service.factory';
import { PaymentController } from './payment.controller';

@Module({
  imports: [HttpModule, forwardRef(() => OrderModule)],
  controllers: [PaymentController],
  providers: [PaymentServiceFactory, PayletterService],
  exports: [PaymentServiceFactory],
})
export class PaymentModule {}

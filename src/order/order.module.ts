import { forwardRef, Module } from '@nestjs/common';
import { PaymentModule } from 'src/payment/payment.module';
import { ProductModule } from 'src/product/product.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [forwardRef(() => PaymentModule), ProductModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}

import { Module } from '@nestjs/common';
import { CreditFulfillmentHandler } from './fulfillment-handler/credit-fulfillment-handler';
import { ProductFulfillmentHandlerFactory } from './fulfillment-handler/product-fulfillment-handler.factory';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductFulfillmentHandlerFactory,
    CreditFulfillmentHandler,
  ],
  exports: [ProductService, ProductFulfillmentHandlerFactory],
})
export class ProductModule {}

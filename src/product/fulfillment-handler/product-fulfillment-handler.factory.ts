import { Injectable } from '@nestjs/common';
import { ProductType } from 'generated/prisma';
import { CreditFulfillmentHandler } from './credit-fulfillment-handler';
import { ProductFulfillmentHandler } from './product-fulfillment-handler.interface';

@Injectable()
export class ProductFulfillmentHandlerFactory {
  constructor(private readonly creditHandler: CreditFulfillmentHandler) {}

  getHandler(type: ProductType): ProductFulfillmentHandler {
    switch (type) {
      case ProductType.CREDIT:
        return this.creditHandler;
    }
  }
}

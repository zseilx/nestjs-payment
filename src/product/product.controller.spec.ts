import { Test, TestingModule } from '@nestjs/testing';
import { CreditFulfillmentHandler } from './fulfillment-handler/credit-fulfillment-handler';
import { ProductFulfillmentHandlerFactory } from './fulfillment-handler/product-fulfillment-handler.factory';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

describe('ProductController', () => {
  let controller: ProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            // ProductService의 메서드들을 모킹
            processProducts: jest.fn(),
          },
        },
        {
          provide: ProductFulfillmentHandlerFactory,
          useValue: {
            // ProductFulfillmentHandlerFactory의 메서드들을 모킹
            createHandler: jest.fn(),
          },
        },
        {
          provide: CreditFulfillmentHandler,
          useValue: {
            // CreditFulfillmentHandler의 메서드들을 모킹
            fulfill: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

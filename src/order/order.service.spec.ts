import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { PaymentServiceFactory } from 'src/payment/payment-service.factory';
import { ProductService } from 'src/product/product.service';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PaymentServiceFactory,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: ProductService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

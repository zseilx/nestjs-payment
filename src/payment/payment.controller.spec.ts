import { Test, TestingModule } from '@nestjs/testing';
import { PayletterService } from './payletter/payletter.service';
import { PaymentServiceFactory } from './payment-service.factory';
import { PaymentController } from './payment.controller';

describe('PaymentController', () => {
  let controller: PaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        { provide: PaymentServiceFactory, useValue: {} },
        { provide: PayletterService, useValue: {} },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

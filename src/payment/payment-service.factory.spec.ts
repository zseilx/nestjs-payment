import { Test, TestingModule } from '@nestjs/testing';
import { PgProviderType } from 'generated/prisma';
import { PayletterService } from './payletter/payletter.service';
import { PaymentServiceFactory } from './payment-service.factory';

describe('PaymentServiceFactory', () => {
  let factory: PaymentServiceFactory;
  let payletterService: any;

  beforeEach(async () => {
    const mockPayletterService = {
      getPaymentFlowType: jest.fn(),
      requestPayment: jest.fn(),
      cancelPayment: jest.fn(),
      cancelPaymentPartial: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentServiceFactory,
        { provide: PayletterService, useValue: mockPayletterService },
      ],
    }).compile();

    factory = module.get<PaymentServiceFactory>(PaymentServiceFactory);
    payletterService = module.get(PayletterService);
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  describe('getProvider', () => {
    it('PAYLETTER 제공자를 정상적으로 반환해야 함', () => {
      // Act
      const provider = factory.getProvider(PgProviderType.PAYLETTER);

      // Assert
      expect(provider).toBe(payletterService);
    });

    it('지원하지 않는 PG를 요청하면 에러를 발생시켜야 함', () => {
      // Act & Assert
      expect(() => factory.getProvider('UNSUPPORTED_PG' as any)).toThrow(
        'Unsupported PG: UNSUPPORTED_PG',
      );
    });
  });
});

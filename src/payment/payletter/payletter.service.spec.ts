import { HttpService } from '@nestjs/axios';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Decimal } from 'generated/prisma/runtime/library';
import { of, throwError } from 'rxjs';
import { AppConfigService } from 'src/config/app-config/app-config.service';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { OrderService } from 'src/order/order.service';
import { PaymentFlowType } from '../interfaces/payment-service.interface';
import { PayletterService } from './payletter.service';

describe('PayletterService', () => {
  let service: PayletterService;
  let httpService: any;
  let prismaService: any;
  let orderService: any;
  let appConfigService: any;

  const mockOrder = {
    id: 'order_1',
    userId: 'user_1',
    status: 'PENDING',
    totalAmount: 11000,
    vatAmount: 1000,
  };

  const mockPayment = {
    id: 'payment_1',
    pgProvider: 'PAYLETTER',
    amount: 11000,
    status: 'INITIATED',
  };

  beforeEach(async () => {
    const mockHttpService = {
      request: jest.fn(),
    };

    const mockPrismaService = {
      payment: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      payletterDetail: {
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockOrderService = {
      getOrder: jest.fn(),
      fulfillOrder: jest.fn(),
    };

    const mockAppConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        const config = {
          PAYLETTER_API_URL: 'https://api.payletter.com',
          PAYLETTER_API_KEY: 'test_api_key',
          PAYLETTER_ID: 'test_id',
          SERVER_HOST: 'https://test.server.com',
        };
        return config[key as keyof typeof config];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayletterService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: OrderService, useValue: mockOrderService },
        { provide: AppConfigService, useValue: mockAppConfigService },
      ],
    }).compile();

    service = module.get<PayletterService>(PayletterService);
    httpService = module.get(HttpService);
    prismaService = module.get(PrismaService);
    orderService = module.get(OrderService);
    appConfigService = module.get(AppConfigService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPaymentFlowType', () => {
    it('SERVER_INITIATED를 반환해야 함', () => {
      // Act
      const flowType = service.getPaymentFlowType();

      // Assert
      expect(flowType).toBe(PaymentFlowType.SERVER_INITIATED);
    });
  });

  describe('requestPayment', () => {
    const paymentRequest = {
      orderId: 'order_1',
      userId: 'user_1',
      productName: '테스트 상품',
      paymentMethod: 'CARD',
      successRedirectUrl: 'http://example.com/success',
      failureRedirectUrl: 'http://example.com/failure',
      cancelRedirectUrl: 'http://example.com/cancel',
    };

    it('결제 요청을 정상적으로 처리해야 함', async () => {
      // Arrange
      const payletterResponse = {
        online_url: 'http://payletter.online.url',
        mobile_url: 'http://payletter.mobile.url',
      };

      orderService.getOrder.mockResolvedValue(mockOrder);
      prismaService.payment.create.mockResolvedValue(mockPayment);
      prismaService.payletterDetail.create.mockResolvedValue({});
      prismaService.payment.update.mockResolvedValue(mockPayment);
      httpService.request.mockReturnValue(of({ data: payletterResponse }));

      // Act
      const result = await service.requestPayment(paymentRequest as any);

      // Assert
      expect(orderService.getOrder).toHaveBeenCalledWith('order_1');
      expect(prismaService.payment.create).toHaveBeenCalled();
      expect(httpService.request).toHaveBeenCalledWith({
        method: 'POST',
        baseURL: 'https://api.payletter.com/v1.0/payments/request',
        headers: {
          Authorization: 'PLKEY test_api_key',
        },
        data: expect.objectContaining({
          client_id: 'test_id',
          user_id: 'user_1',
          product_name: '테스트 상품',
          amount: 11000,
          order_no: 'order_1',
        }),
      });
      expect(result).toEqual({
        paymentId: 'payment_1',
        onlineUrl: 'http://payletter.online.url',
        mobileUrl: 'http://payletter.mobile.url',
        refundableDate: expect.any(Date),
      });
    });

    it('존재하지 않는 주문이면 NotFoundException을 발생시켜야 함', async () => {
      // Arrange
      orderService.getOrder.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.requestPayment(paymentRequest as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('주문자가 일치하지 않으면 BadRequestException을 발생시켜야 함', async () => {
      // Arrange
      const otherUserOrder = { ...mockOrder, userId: 'other_user' };
      orderService.getOrder.mockResolvedValue(otherUserOrder);

      // Act & Assert
      await expect(
        service.requestPayment(paymentRequest as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('결제 가능하지 않은 주문이면 BadRequestException을 발생시켜야 함', async () => {
      // Arrange
      const paidOrder = { ...mockOrder, status: 'PAID' };
      orderService.getOrder.mockResolvedValue(paidOrder);

      // Act & Assert
      await expect(
        service.requestPayment(paymentRequest as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('페이레터 API 에러가 발생하면 HttpException을 발생시켜야 함', async () => {
      // Arrange
      orderService.getOrder.mockResolvedValue(mockOrder);
      prismaService.payment.create.mockResolvedValue(mockPayment);
      httpService.request.mockReturnValue(
        throwError(() => ({
          response: {
            data: { code: 'ERROR_CODE', message: 'Error message' },
          },
          status: 400,
        })),
      );

      // Act & Assert
      await expect(
        service.requestPayment(paymentRequest as any),
      ).rejects.toThrow();
    });
  });

  describe('cancelPayment', () => {
    it('결제 취소를 정상적으로 처리해야 함', async () => {
      // Arrange
      const paymentWithDetail = {
        ...mockPayment,
        payletterDetail: {
          tid: 'test_tid',
          amount: 11000,
        },
      };
      const cancelResponse = { result: 'success' };

      prismaService.payment.findUnique.mockResolvedValue(paymentWithDetail);
      httpService.request.mockReturnValue(of({ data: cancelResponse }));

      // Act
      await service.cancelPayment('payment_1', 'user_1');

      // Assert
      expect(prismaService.payment.findUnique).toHaveBeenCalledWith({
        where: { id: 'payment_1' },
        include: { payletterDetail: true },
      });
      expect(httpService.request).toHaveBeenCalledWith({
        method: 'POST',
        baseURL: 'https://api.payletter.com/v1.0/payments/cancel',
        headers: {
          Authorization: 'PLKEY test_api_key',
        },
        data: expect.objectContaining({
          tid: 'test_tid',
        }),
      });
    });

    it('결제 정보가 없으면 NotFoundException을 발생시켜야 함', async () => {
      // Arrange
      prismaService.payment.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.cancelPayment('invalid_payment', 'user_1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelPaymentPartial', () => {
    it('부분 취소를 정상적으로 처리해야 함', async () => {
      // Arrange
      const paymentWithDetail = {
        ...mockPayment,
        payletterDetail: {
          tid: 'test_tid',
          amount: 11000,
          pgcode: 'card',
        },
      };
      const partialAmount = new Decimal(5000);
      const cancelResponse = { result: 'success' };

      prismaService.payment.findUnique.mockResolvedValue(paymentWithDetail);
      httpService.request.mockReturnValue(of({ data: cancelResponse }));

      // Act
      await service.cancelPaymentPartial('payment_1', 'user_1', partialAmount);

      // Assert
      expect(prismaService.payment.findUnique).toHaveBeenCalledWith({
        where: { id: 'payment_1' },
        include: { payletterDetail: true },
      });
      expect(httpService.request).toHaveBeenCalledWith({
        method: 'POST',
        baseURL: 'https://api.payletter.com/v1.0/payments/cancel/partial',
        headers: {
          Authorization: 'PLKEY test_api_key',
        },
        data: expect.objectContaining({
          pgcode: 'card',
          client_id: 'test_id',
          user_id: 'user_1',
          tid: 'test_tid',
          amount: 5000,
          ip_addr: '127.0.0.1',
        }),
      });
    });
  });

  describe('handleCallback', () => {
    it('콜백을 정상적으로 처리해야 함', async () => {
      // Arrange
      const callbackData = {
        tid: 'test_tid',
        amount: 11000,
        user_id: 'user_1',
        order_no: 'order_1',
        payhash: 'valid_hash',
        toCamelCase: jest.fn().mockReturnValue({
          tid: 'test_tid',
          amount: 11000,
          userId: 'user_1',
          orderNo: 'order_1',
        }),
      };

      jest.spyOn(service, 'verifyCallback').mockReturnValue(true);
      orderService.fulfillOrder.mockResolvedValue(undefined);
      prismaService.payment.update.mockResolvedValue(mockPayment);
      prismaService.payletterDetail.update.mockResolvedValue({});

      // Act
      const result = await service.handleCallback(
        'payment_1',
        callbackData as any,
      );

      // Assert
      expect(service.verifyCallback).toHaveBeenCalledWith(callbackData);
      expect(result).toEqual({ code: 0, message: '성공' });
    });

    it('잘못된 콜백 데이터면 에러 응답을 반환해야 함', async () => {
      // Arrange
      const callbackData = {
        tid: 'test_tid',
        amount: 11000,
        user_id: 'user_1',
        order_no: 'order_1',
        payhash: 'invalid_hash',
        toCamelCase: jest.fn().mockReturnValue({}),
      };

      jest.spyOn(service, 'verifyCallback').mockReturnValue(false);

      // Act
      const result = await service.handleCallback(
        'payment_1',
        callbackData as any,
      );

      // Assert
      expect(result).toEqual({ code: 1, message: 'Invalid payhash' });
    });
  });

  describe('verifyCallback', () => {
    it('유효한 콜백 데이터를 검증해야 함', () => {
      // Arrange
      const callbackData = {
        tid: 'test_tid',
        amount: '11000',
        user_id: 'user_1',
        payhash: expect.any(String),
      };

      // Mock generatePayhash to return the expected hash
      jest
        .spyOn(service as any, 'generatePayhash')
        .mockReturnValue('expected_hash');
      callbackData.payhash = 'expected_hash';

      // Act
      const isValid = service.verifyCallback(callbackData as any);

      // Assert
      expect(isValid).toBe(true);
    });

    it('잘못된 해시값이면 false를 반환해야 함', () => {
      // Arrange
      const callbackData = {
        tid: 'test_tid',
        amount: '11000',
        user_id: 'user_1',
        payhash: 'invalid_hash',
      };

      jest
        .spyOn(service as any, 'generatePayhash')
        .mockReturnValue('expected_hash');

      // Act
      const isValid = service.verifyCallback(callbackData as any);

      // Assert
      expect(isValid).toBe(false);
    });
  });
});

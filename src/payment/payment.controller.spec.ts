import { Test, TestingModule } from '@nestjs/testing';
import { PgProviderType } from 'generated/prisma';
import { OrderService } from 'src/order/order.service';
import { PaymentFlowType } from './interfaces/payment-service.interface';
import { PaymentServiceFactory } from './payment-service.factory';
import { PaymentController } from './payment.controller';

describe('PaymentController', () => {
  let controller: PaymentController;
  let paymentServiceFactory: any;
  let orderService: any;

  const mockPaymentService = {
    getPaymentFlowType: jest.fn(),
    requestPayment: jest.fn(),
    handleCallback: jest.fn(),
    handleReturn: jest.fn(),
    handleCancel: jest.fn(),
    transformCallbackData: jest.fn(),
    transformReturnData: jest.fn(),
    transformCancelData: jest.fn(),
  };

  beforeEach(async () => {
    const mockPaymentServiceFactory = {
      getProvider: jest.fn().mockReturnValue(mockPaymentService),
    };

    const mockOrderService = {
      getOrder: jest.fn(),
      fulfillOrder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        { provide: PaymentServiceFactory, useValue: mockPaymentServiceFactory },
        { provide: OrderService, useValue: mockOrderService },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    paymentServiceFactory = module.get(PaymentServiceFactory);
    orderService = module.get(OrderService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('startServerInitiatedPayment', () => {
    const paymentRequest = {
      orderId: 'order_1',
      userId: 'user_1',
      productName: '테스트 상품',
      paymentMethod: 'CARD',
      successRedirectUrl: 'http://example.com/success',
      failureRedirectUrl: 'http://example.com/failure',
      cancelRedirectUrl: 'http://example.com/cancel',
    };

    it('서버 이니시에이팅 결제를 정상적으로 시작해야 함', async () => {
      // Arrange
      const mockResponse = {
        paymentId: 'payment_1',
        onlineUrl: 'http://payment.url',
        mobileUrl: 'http://mobile.payment.url',
      };
      mockPaymentService.getPaymentFlowType.mockReturnValue(
        PaymentFlowType.SERVER_INITIATED,
      );
      mockPaymentService.requestPayment.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.startServerInitiatedPayment(
        PgProviderType.PAYLETTER,
        paymentRequest as any,
      );

      // Assert
      expect(paymentServiceFactory.getProvider).toHaveBeenCalledWith(
        PgProviderType.PAYLETTER,
      );
      expect(mockPaymentService.getPaymentFlowType).toHaveBeenCalled();
      expect(mockPaymentService.requestPayment).toHaveBeenCalledWith(
        paymentRequest,
      );
      expect(result).toEqual(mockResponse);
    });

    it('지원하지 않는 결제 방식이면 에러를 발생시켜야 함', async () => {
      // Arrange
      mockPaymentService.getPaymentFlowType.mockReturnValue(
        PaymentFlowType.CLIENT_INITIATED,
      );

      // Act & Assert
      await expect(
        controller.startServerInitiatedPayment(
          PgProviderType.PAYLETTER,
          paymentRequest as any,
        ),
      ).rejects.toThrow(
        'PAYLETTER는 서버 이니시에이팅 방식을 지원하지 않습니다.',
      );
    });
  });

  describe('handleCallback', () => {
    it('콜백을 정상적으로 처리해야 함', async () => {
      // Arrange
      const paymentId = 'payment_1';
      const callbackData = { status: 'success', amount: 1000 };
      const transformedData = { processedStatus: 'success' };
      const mockResponse = { code: 200, message: 'success' };

      mockPaymentService.transformCallbackData.mockReturnValue(transformedData);
      mockPaymentService.handleCallback.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.handleCallback(
        paymentId,
        PgProviderType.PAYLETTER,
        callbackData,
      );

      // Assert
      expect(paymentServiceFactory.getProvider).toHaveBeenCalledWith(
        PgProviderType.PAYLETTER,
      );
      expect(mockPaymentService.transformCallbackData).toHaveBeenCalledWith(
        callbackData,
      );
      expect(mockPaymentService.handleCallback).toHaveBeenCalledWith(
        paymentId,
        transformedData,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('handleReturn', () => {
    it('리턴을 정상적으로 처리하고 리다이렉트해야 함', async () => {
      // Arrange
      const paymentId = 'payment_1';
      const returnData = { status: 'success' };
      const transformedData = { processedStatus: 'success' };
      const redirectUrl = 'http://example.com/success';
      const mockResponse = {
        redirect: jest.fn(),
      };

      mockPaymentService.transformReturnData.mockReturnValue(transformedData);
      mockPaymentService.handleReturn.mockResolvedValue(redirectUrl);

      // Act
      await controller.handleReturn(
        paymentId,
        PgProviderType.PAYLETTER,
        mockResponse as any,
        returnData,
      );

      // Assert
      expect(paymentServiceFactory.getProvider).toHaveBeenCalledWith(
        PgProviderType.PAYLETTER,
      );
      expect(mockPaymentService.transformReturnData).toHaveBeenCalledWith(
        returnData,
      );
      expect(mockPaymentService.handleReturn).toHaveBeenCalledWith(
        paymentId,
        transformedData,
      );
      expect(mockResponse.redirect).toHaveBeenCalledWith(redirectUrl);
    });
  });

  describe('handleCancel', () => {
    it('취소를 정상적으로 처리해야 함', async () => {
      // Arrange
      const paymentId = 'payment_1';
      const cancelData = { reason: 'user_cancel' };
      const transformedData = { processedReason: 'user_cancel' };

      mockPaymentService.transformCancelData.mockReturnValue(transformedData);
      mockPaymentService.handleCancel.mockResolvedValue(undefined);

      // Act
      await controller.handleCancel(
        paymentId,
        PgProviderType.PAYLETTER,
        cancelData,
      );

      // Assert
      expect(paymentServiceFactory.getProvider).toHaveBeenCalledWith(
        PgProviderType.PAYLETTER,
      );
      expect(mockPaymentService.transformCancelData).toHaveBeenCalledWith(
        cancelData,
      );
      expect(mockPaymentService.handleCancel).toHaveBeenCalledWith(
        paymentId,
        transformedData,
      );
    });
  });
});

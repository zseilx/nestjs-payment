import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { PaymentServiceFactory } from 'src/payment/payment-service.factory';
import { ProductService } from 'src/product/product.service';
import { OrderService } from './order.service';

// OrderStatus enum을 직접 정의
enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELED = 'CANCELED',
}

describe('OrderService', () => {
  let service: OrderService;
  let prismaService: any;
  let productService: any;
  let paymentServiceFactory: any;

  const mockOrder = {
    id: 'order_1',
    userId: 'user_1',
    status: OrderStatus.PENDING,
    totalAmount: 11000,
    vatAmount: 1000,
    paidAmount: null,
    refundedAmount: null,
    paymentId: null,
    paidAt: null,
    refundableDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
    canceledAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    orderItems: [
      {
        id: 'item_1',
        productId: 'prod_1',
        productName: '테스트 상품',
        quantity: 1,
        unitPrice: 10000,
        vatRate: 0.1,
        vatAmount: 1000,
        canceledQty: 0,
        product: {
          id: 'prod_1',
          name: '테스트 상품',
          price: 10000,
        },
      },
    ],
    payment: {
      id: 'payment_1',
      pgProvider: 'KAKAO',
    },
  };

  const mockProduct = {
    id: 'prod_1',
    name: '테스트 상품',
    price: 10000,
    isActive: true,
    vatRate: 0.1, // 부가세율 추가
  };

  beforeEach(async () => {
    const mockPrismaService = {
      order: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      orderItem: {
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(),
      fetchPaginatedResult: jest.fn(),
    };

    const mockProductService = {
      findManyByIds: jest.fn(),
      processProducts: jest.fn(),
      refundProducts: jest.fn(),
    };

    const mockPaymentService = {
      cancelPayment: jest.fn(),
      cancelPaymentPartial: jest.fn(),
    };

    const mockPaymentServiceFactory = {
      getProvider: jest.fn().mockReturnValue(mockPaymentService),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ProductService, useValue: mockProductService },
        { provide: PaymentServiceFactory, useValue: mockPaymentServiceFactory },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prismaService = module.get(PrismaService);
    productService = module.get(ProductService);
    paymentServiceFactory = module.get(PaymentServiceFactory);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const createOrderRequest = {
      userId: 'user_1',
      orderItems: [{ productId: 'prod_1', quantity: 1 }],
    };

    it('정상적으로 주문을 생성해야 함', async () => {
      // Arrange
      productService.findManyByIds.mockResolvedValue([mockProduct]);
      prismaService.order.create.mockResolvedValue(mockOrder);

      // Act
      const result = await service.createOrder(createOrderRequest);

      // Assert
      expect(productService.findManyByIds).toHaveBeenCalledWith(['prod_1']);
      expect(prismaService.order.create).toHaveBeenCalledWith({
        data: {
          userId: 'user_1',
          status: OrderStatus.PENDING,
          totalAmount: expect.any(Object), // Decimal 객체
          vatAmount: expect.any(Object), // Decimal 객체
          orderItems: {
            createMany: {
              data: expect.arrayContaining([
                expect.objectContaining({
                  productName: '테스트 상품',
                  productId: 'prod_1',
                  quantity: 1,
                  unitPrice: 10000,
                  vatRate: 0.1,
                  vatAmount: expect.any(Object),
                }),
              ]),
            },
          },
        },
        include: {
          orderItems: true,
        },
      });
      expect(result).toBeDefined();
    });

    it('존재하지 않는 상품이 있으면 BadRequestException을 발생시켜야 함', async () => {
      // Arrange
      productService.findManyByIds.mockResolvedValue([]);

      // Act & Assert
      await expect(service.createOrder(createOrderRequest)).rejects.toThrow(
        BadRequestException,
      );
      expect(productService.findManyByIds).toHaveBeenCalledWith(['prod_1']);
    });
  });

  describe('findMany', () => {
    it('주문 목록을 정상적으로 조회해야 함', async () => {
      // Arrange
      const request = {
        userId: 'user_1',
        page: 1,
        take: 10,
        order: 'desc' as const,
      };
      const mockResult = { data: [mockOrder], total: 1 };
      prismaService.fetchPaginatedResult.mockResolvedValue(mockResult);

      // Act
      const result = await service.findMany(request);

      // Assert
      expect(prismaService.fetchPaginatedResult).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('getOrder', () => {
    it('주문을 정상적으로 조회해야 함', async () => {
      // Arrange
      prismaService.order.findUnique.mockResolvedValue(mockOrder);

      // Act
      const result = await service.getOrder('order_1');

      // Assert
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order_1' },
        include: { orderItems: true },
      });
      expect(result).toBeDefined();
    });

    it('주문이 존재하지 않으면 null을 반환해야 함', async () => {
      // Arrange
      prismaService.order.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.getOrder('invalid_order');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateOrder', () => {
    const updateOrderRequest = {
      userId: 'user_1',
      orderItems: [{ productId: 'prod_1', quantity: 2 }],
    };

    it('주문을 정상적으로 수정해야 함', async () => {
      // Arrange
      const pendingOrder = { ...mockOrder, status: OrderStatus.PENDING };
      prismaService.order.findUnique.mockResolvedValue(pendingOrder);
      productService.findManyByIds.mockResolvedValue([mockProduct]);
      prismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaService);
      });
      prismaService.order.update.mockResolvedValue(mockOrder);

      // Act
      const result = await service.updateOrder('order_1', updateOrderRequest);

      // Assert
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order_1' },
        include: { orderItems: true },
      });
      expect(result).toBeDefined();
    });

    it('주문이 존재하지 않으면 NotFoundException을 발생시켜야 함', async () => {
      // Arrange
      prismaService.order.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateOrder('invalid_order', updateOrderRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it('PENDING 상태가 아니면 BadRequestException을 발생시켜야 함', async () => {
      // Arrange
      const paidOrder = { ...mockOrder, status: OrderStatus.PAID };
      prismaService.order.findUnique.mockResolvedValue(paidOrder);

      // Act & Assert
      await expect(
        service.updateOrder('order_1', updateOrderRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('다른 사용자의 주문이면 BadRequestException을 발생시켜야 함', async () => {
      // Arrange
      const otherUserOrder = { ...mockOrder, userId: 'other_user' };
      prismaService.order.findUnique.mockResolvedValue(otherUserOrder);

      // Act & Assert
      await expect(
        service.updateOrder('order_1', updateOrderRequest),
      ).rejects.toThrow(BadRequestException); // NotFoundException이 아닌 BadRequestException
    });
  });

  describe('cancelOrder', () => {
    it('주문을 정상적으로 취소해야 함', async () => {
      // Arrange
      const paidOrderWithPayment = {
        ...mockOrder,
        status: OrderStatus.PAID,
        refundableDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 미래 날짜
        payment: { id: 'payment_1', pgProvider: 'KAKAO' },
      };
      prismaService.order.findUnique.mockResolvedValue(paidOrderWithPayment);
      prismaService.order.update.mockResolvedValue(undefined);
      productService.refundProducts.mockResolvedValue(undefined);

      // Act
      await service.cancelOrder('order_1');

      // Assert
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order_1', status: OrderStatus.PAID },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          payment: true,
        },
      });
      expect(productService.refundProducts).toHaveBeenCalled();
      expect(paymentServiceFactory.getProvider).toHaveBeenCalledWith('KAKAO');
    });

    it('주문이 존재하지 않으면 NotFoundException을 발생시켜야 함', async () => {
      // Arrange
      prismaService.order.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.cancelOrder('invalid_order')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('환불 가능 기간이 지났으면 BadRequestException을 발생시켜야 함', async () => {
      // Arrange
      const expiredOrder = {
        ...mockOrder,
        status: OrderStatus.PAID,
        refundableDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 과거 날짜
        payment: { id: 'payment_1', pgProvider: 'KAKAO' },
      };
      prismaService.order.findUnique.mockResolvedValue(expiredOrder);

      // Act & Assert
      await expect(service.cancelOrder('order_1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancelOrderPartial', () => {
    const cancelRequest = {
      orderItems: [{ productId: 'prod_1', quantity: 1 }],
      reason: '단순 변심',
    };

    it('주문을 정상적으로 부분 취소해야 함', async () => {
      // Arrange
      const orderWithPayment = {
        ...mockOrder,
        status: OrderStatus.PAID,
        refundableDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 미래 날짜
        payment: { id: 'payment_1', pgProvider: 'KAKAO' },
      };
      prismaService.order.findUnique.mockResolvedValue(orderWithPayment);
      prismaService.order.update.mockResolvedValue(undefined);
      productService.refundProducts.mockResolvedValue(undefined);

      // Act
      await service.cancelOrderPartial('order_1', cancelRequest);

      // Assert
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        include: {
          payment: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
        where: {
          id: 'order_1',
        },
      });
      expect(productService.refundProducts).toHaveBeenCalled();
      expect(paymentServiceFactory.getProvider).toHaveBeenCalledWith('KAKAO');
    });

    it('주문이 존재하지 않으면 NotFoundException을 발생시켜야 함', async () => {
      // Arrange
      prismaService.order.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.cancelOrderPartial('order_1', cancelRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it('결제 정보가 없으면 NotFoundException을 발생시켜야 함', async () => {
      // Arrange
      const orderWithoutPayment = { ...mockOrder, payment: null };
      prismaService.order.findUnique.mockResolvedValue(orderWithoutPayment);

      // Act & Assert
      await expect(
        service.cancelOrderPartial('order_1', cancelRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it('환불 가능 기간이 지났으면 BadRequestException을 발생시켜야 함', async () => {
      // Arrange
      const expiredOrder = {
        ...mockOrder,
        refundableDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 과거 날짜
        payment: { id: 'payment_1', pgProvider: 'KAKAO' },
      };
      prismaService.order.findUnique.mockResolvedValue(expiredOrder);

      // Act & Assert
      await expect(
        service.cancelOrderPartial('order_1', cancelRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('fulfillOrder', () => {
    it('주문을 정상적으로 완료 처리해야 함', async () => {
      // Arrange
      const pendingOrder = { ...mockOrder, status: OrderStatus.PENDING };
      prismaService.order.findUnique.mockResolvedValue(pendingOrder);
      prismaService.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PAID,
      });
      productService.processProducts.mockResolvedValue(undefined);

      // Act
      await service.fulfillOrder('order_1', 11000);

      // Assert
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order_1' },
      });
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order_1' },
        include: { orderItems: true },
        data: {
          paidAmount: 11000,
          status: OrderStatus.PAID,
          paidAt: expect.any(Date),
        },
      });
      expect(productService.processProducts).toHaveBeenCalled();
    });

    it('주문이 존재하지 않으면 NotFoundException을 발생시켜야 함', async () => {
      // Arrange
      prismaService.order.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.fulfillOrder('invalid_order', 11000),
      ).rejects.toThrow(NotFoundException);
    });

    it('이미 완료된 주문이면 처리하지 않고 반환해야 함', async () => {
      // Arrange
      const paidOrder = { ...mockOrder, status: OrderStatus.PAID };
      prismaService.order.findUnique.mockResolvedValue(paidOrder);

      // Act
      await service.fulfillOrder('order_1', 11000);

      // Assert
      expect(prismaService.order.update).not.toHaveBeenCalled();
      expect(productService.processProducts).not.toHaveBeenCalled();
    });
  });
});

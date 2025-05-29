import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from 'generated/prisma';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: jest.Mocked<OrderService>;

  beforeEach(async () => {
    const mockOrderService = {
      createOrder: jest.fn(),
      findMany: jest.fn(),
      getOrder: jest.fn(),
      updateOrder: jest.fn(),
      cancelOrder: jest.fn(),
      cancelOrderPartial: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get(OrderService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('주문 생성 메서드를 호출해야 함', async () => {
      // Arrange
      const request = { orderItems: [{ productId: 'prod_1', quantity: 1 }] };
      const mockResult = { id: 'order_1', status: OrderStatus.PENDING };
      orderService.createOrder.mockResolvedValue(mockResult as any);

      // Act
      const result = await controller.createOrder(request as any);

      // Assert
      expect(orderService.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          orderItems: request.orderItems,
          userId: 'test',
        }),
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getOrders', () => {
    it('주문 목록 조회 메서드를 호출해야 함', async () => {
      // Arrange
      const request = { take: 10, order: 'desc' };
      const mockResult = { data: [], total: 0 };
      orderService.findMany.mockResolvedValue(mockResult as any);

      // Act
      const result = await controller.getOrders(request as any);

      // Assert
      expect(orderService.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          order: 'desc',
          userId: 'test',
        }),
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getOrder', () => {
    it('주문 상세 조회 메서드를 호출해야 함', async () => {
      // Arrange
      const mockResult = { id: 'order_1', status: OrderStatus.PENDING };
      orderService.getOrder.mockResolvedValue(mockResult as any);

      // Act
      const result = await controller.getOrder('order_1');

      // Assert
      expect(orderService.getOrder).toHaveBeenCalledWith('order_1');
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateOrder', () => {
    it('주문 수정 메서드를 호출해야 함', async () => {
      // Arrange
      const request = { orderItems: [{ productId: 'prod_1', quantity: 2 }] };
      const mockResult = { id: 'order_1', status: OrderStatus.PENDING };
      orderService.updateOrder.mockResolvedValue(mockResult as any);

      // Act
      const result = await controller.updateOrder('order_1', request as any);

      // Assert
      expect(orderService.updateOrder).toHaveBeenCalledWith(
        'order_1',
        expect.objectContaining({
          orderItems: request.orderItems,
          userId: 'test',
        }),
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('cancelOrder', () => {
    it('주문 취소 메서드를 호출해야 함', async () => {
      // Arrange
      orderService.cancelOrder.mockResolvedValue(undefined);

      // Act
      await controller.cancelOrder('order_1');

      // Assert
      expect(orderService.cancelOrder).toHaveBeenCalledWith('order_1');
    });
  });

  describe('cancelOrderPartial', () => {
    it('주문 부분 취소 메서드를 호출해야 함', async () => {
      // Arrange
      const request = {
        orderItems: [{ productId: 'prod_1', quantity: 1 }],
        reason: '단순 변심',
      };
      orderService.cancelOrderPartial.mockResolvedValue(undefined);

      // Act
      await controller.cancelOrderPartial('order_1', request as any);

      // Assert
      expect(orderService.cancelOrderPartial).toHaveBeenCalledWith(
        'order_1',
        request,
      );
    });
  });
});

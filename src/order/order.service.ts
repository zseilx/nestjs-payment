import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  Order,
  OrderItem,
  OrderStatus,
  PgProviderType,
  Prisma,
} from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { PaymentServiceFactory } from 'src/payment/payment-service.factory';
import { processProductRequest } from 'src/product/dto/process-product.request';
import { ProductService } from 'src/product/product.service';
import {
  CancelOrderPartialItemRequest,
  CancelOrderPartialRequest,
} from './dto/cancel-order-partial.request';
import { CreateOrderRequest } from './dto/create-order.request';
import { DetailOrderResponse } from './dto/detail-order.response';
import { ListOrderResponse } from './dto/list-order.response';
import { SearchOrderRequest } from './dto/search-order.request';
import { UpdateOrderRequest } from './dto/update-order.request';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private readonly VAT_RATE = 0.1; // 10% 부가세율

  constructor(
    @Inject(forwardRef(() => PaymentServiceFactory))
    private readonly paymentServiceFactory: PaymentServiceFactory,
    private readonly prismaService: PrismaService,
    private readonly productService: ProductService,
  ) {}

  // 주문만 생성 (결제는 별도 처리)
  async createOrder(request: CreateOrderRequest) {
    const productIds = request.orderItems.map((item) => item.productId);
    const uniqueProductIds = [...new Set(productIds)];
    const products = await this.productService.findManyByIds(uniqueProductIds);

    if (products.length !== uniqueProductIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missing = uniqueProductIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(
        `다음 상품이 존재하지 않습니다: ${missing.join(', ')}`,
      );
    }

    // 주문 금액 및 부가세 계산
    const orderItems = request.orderItems.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product)
        throw new NotFoundException(
          `상품 ${item.productId}을 찾을 수 없습니다`,
        );

      const unitPriceDecimal = new Decimal(product.price);
      const quantity = item.quantity;
      const subtotal = unitPriceDecimal.mul(quantity);

      // 상품별 부가세 계산
      const vatRate = product.vatRate;
      const vatAmount = subtotal.mul(vatRate);

      const totalPrice = subtotal.add(vatAmount);

      return {
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        subtotal, // VAT 미포함 금액
        vatRate,
        vatAmount,
        totalPrice, // VAT 포함 금액
      };
    });

    const totalSubtotal = orderItems.reduce(
      (sum, item) => sum.add(item.subtotal),
      new Decimal(0),
    );

    const totalVatAmount = orderItems.reduce(
      (sum, item) => sum.add(item.vatAmount),
      new Decimal(0),
    );

    const totalAmount = totalSubtotal.add(totalVatAmount);

    // 주문만 생성 (결제 정보 없이)
    const order = await this.prismaService.order.create({
      data: {
        userId: request.userId,
        status: OrderStatus.PENDING,
        totalAmount: totalAmount,
        vatAmount: totalVatAmount,
        orderItems: {
          createMany: {
            data: orderItems.map((item) => ({
              productName: item.name,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              vatRate: item.vatRate,
              vatAmount: item.vatAmount,
            })),
          },
        },
      },
      include: {
        orderItems: true,
      },
    });

    return plainToInstance(DetailOrderResponse, order);
  }

  async findMany(request: SearchOrderRequest) {
    const where: Prisma.OrderWhereInput = {};
    where.userId = request.userId;

    this.logger.debug(where);

    return this.prismaService.fetchPaginatedResult(
      ListOrderResponse,
      Prisma.ModelName.Order,
      request,
      where,
    );
  }

  async getOrder(orderId: string) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return null;
    }

    // Decimal 값들을 안전하게 number로 변환
    return plainToInstance(DetailOrderResponse, order);
  }

  async fulfillOrder(orderId: string, paidAmount: number | Decimal) {
    const checkOrder = await this.prismaService.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!checkOrder) {
      throw new NotFoundException(
        '주문 정보 또는 결제 정보를 찾을 수 없습니다',
      );
    } else if (checkOrder.status !== OrderStatus.PENDING) {
      this.logger.log(`이미 상품 지급이 완료된 주문입니다. ${orderId}`);
      return;
    }

    const order: Order & { orderItems: OrderItem[] } =
      await this.prismaService.order.update({
        where: {
          id: orderId,
        },
        include: {
          orderItems: true,
        },
        data: {
          paidAmount: paidAmount,
          status: OrderStatus.PAID,
          paidAt: new Date(),
        },
      });

    const products: processProductRequest[] = order.orderItems.map(
      (item: OrderItem) => {
        return {
          productId: item.productId,
          quantity: item.quantity,
        } as processProductRequest;
      },
    );

    // 주문 상품 지급 절차
    await this.productService.processProducts(products);
  }

  async cancelOrder(orderId: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId, status: OrderStatus.PAID },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다');
    }

    // 1. 환불 가능 여부 확인
    if (!order.refundableDate || new Date() > order.refundableDate) {
      throw new BadRequestException('환불 가능 기간이 지났습니다');
    }

    if (!order.payment) {
      throw new InternalServerErrorException('결제 정보를 찾을 수 없습니다');
    }

    // 2. 상품 환불 처리
    await this.productService.refundProducts(
      order.orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity - item.canceledQty, // 이미 취소된 수량 제외
      })),
    );

    await this.paymentServiceFactory
      .getProvider(order.payment.pgProvider as PgProviderType)
      .cancelPayment(order.payment.id, order.userId);

    // 3. 주문 상태 업데이트
    await this.prismaService.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELED,
        canceledAt: new Date(),
      },
    });
  }

  async cancelOrderPartial(
    orderId: string,
    request: CancelOrderPartialRequest,
  ) {
    const order = await this.prismaService.order.findUnique({
      include: {
        payment: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      where: {
        id: orderId,
      },
    });
    if (!order || !order.payment) {
      throw new NotFoundException(
        '주문 정보 또는 결제 정보를 찾을 수 없습니다',
      );
    }
    if (!order.refundableDate || order.refundableDate < new Date()) {
      throw new BadRequestException('환불 가능 기간이 지났습니다');
    }
    this.logger.log(order.orderItems);
    // 1. 환불할 상품 수량 확인
    const refundItems = request.orderItems.map(
      (item: CancelOrderPartialItemRequest) => {
        const orderItem = order.orderItems.find(
          (oi) => oi.productId === item.productId,
        );
        if (!orderItem) {
          throw new NotFoundException(
            `상품 ${item.productId}을 찾을 수 없습니다`,
          );
        }
        if (item.quantity > orderItem.quantity - orderItem.canceledQty) {
          throw new BadRequestException(
            `환불 수량이 남은 수량보다 많습니다. 상품: ${orderItem.productName}`,
          );
        }
        return {
          ...item,
          unitPrice: orderItem.unitPrice,
        };
      },
    );

    // 2. 환불 금액 계산 (부가세 포함)
    const refundAmount = refundItems.reduce((sum, item) => {
      const orderItem = order.orderItems.find(
        (oi) => oi.productId === item.productId,
      );
      if (!orderItem) return sum;

      const itemSubtotal = new Decimal(item.unitPrice).mul(item.quantity);
      const itemVatAmount = itemSubtotal.mul(orderItem.vatRate);
      const itemTotalAmount = itemSubtotal.add(itemVatAmount);

      return sum.add(itemTotalAmount);
    }, new Decimal(0));

    // 3. 결제 부분 취소
    await this.paymentServiceFactory
      .getProvider(order.payment.pgProvider as PgProviderType)
      .cancelPaymentPartial(order.payment.id, order.userId, refundAmount);

    // 4. 상품 환불 처리
    await this.productService.refundProducts(
      refundItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    );

    // 5. 주문 상태 업데이트
    await this.prismaService.order.update({
      where: { id: orderId },
      data: {
        orderItems: {
          update: refundItems.map((item) => ({
            where: {
              id: order.orderItems.find((oi) => oi.productId === item.productId)
                ?.id,
            },
            data: {
              canceledQty: {
                increment: item.quantity,
              },
            },
          })),
        },
      },
    });
  }

  async updateOrder(orderId: string, request: UpdateOrderRequest) {
    // 1. 기존 주문 조회 및 검증
    const existingOrder = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!existingOrder) {
      throw new NotFoundException('주문을 찾을 수 없습니다');
    }

    if (existingOrder.userId !== request.userId) {
      throw new BadRequestException('주문자가 일치하지 않습니다');
    }

    if (existingOrder.status !== OrderStatus.PENDING) {
      throw new BadRequestException('결제 대기 중인 주문만 수정할 수 있습니다');
    }

    // 2. 상품 정보 조회
    const productIds = request.orderItems.map((item) => item.productId);
    const uniqueProductIds = [...new Set(productIds)];
    const products = await this.productService.findManyByIds(uniqueProductIds);

    if (products.length !== uniqueProductIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missing = uniqueProductIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(
        `다음 상품이 존재하지 않습니다: ${missing.join(', ')}`,
      );
    }

    // 3. 새로운 주문 아이템 계산
    const newOrderItems = request.orderItems.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new NotFoundException(
          `상품 ${item.productId}을 찾을 수 없습니다`,
        );
      }

      const unitPriceDecimal = new Decimal(product.price);
      const quantity = item.quantity;
      const subtotal = unitPriceDecimal.mul(quantity);

      // 상품별 부가세 계산
      const vatRate = product.vatRate;
      const vatAmount = subtotal.mul(vatRate);
      const totalPrice = subtotal.add(vatAmount);

      return {
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        subtotal,
        vatRate,
        vatAmount,
        totalPrice,
      };
    });

    // 4. 총 금액 계산
    const totalSubtotal = newOrderItems.reduce(
      (sum, item) => sum.add(item.subtotal),
      new Decimal(0),
    );

    const totalVatAmount = newOrderItems.reduce(
      (sum, item) => sum.add(item.vatAmount),
      new Decimal(0),
    );

    const totalAmount = totalSubtotal.add(totalVatAmount);

    // 5. 트랜잭션으로 주문 및 아이템 업데이트
    const updatedOrder = await this.prismaService.$transaction(async (tx) => {
      // 기존 주문 아이템 삭제
      await tx.orderItem.deleteMany({
        where: { orderId },
      });

      // 주문 및 새 아이템 생성
      return await tx.order.update({
        where: { id: orderId },
        data: {
          totalAmount,
          vatAmount: totalVatAmount,
          orderItems: {
            createMany: {
              data: newOrderItems.map((item) => ({
                productName: item.name,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                vatRate: item.vatRate,
                vatAmount: item.vatAmount,
              })),
            },
          },
        },
        include: {
          orderItems: true,
        },
      });
    });

    return plainToInstance(DetailOrderResponse, updatedOrder);
  }
}

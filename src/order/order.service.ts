import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Order, OrderStatus, PgProviderType } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreatePaymentRequest } from 'src/payment/dto/create-payment.request';
import { PaymentServiceFactory } from 'src/payment/payment-service.factory';
import { processProductRequest } from 'src/product/dto/process-product.request';
import { ProductService } from 'src/product/product.service';
import { CreateOrderRequest } from './dto/create-order.request';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @Inject(forwardRef(() => PaymentServiceFactory))
    private readonly paymentServiceFactory: PaymentServiceFactory,
    private readonly prismaService: PrismaService,
    private readonly productService: ProductService,
  ) {}

  // TODO: 상세 구현
  async createOrder(request: CreateOrderRequest) {
    const productIds = request.items.map((item) => item.productId);

    // 2. 중복 제거 (선택 사항)
    const uniqueProductIds = [...new Set(productIds)];

    // 3. 한 번에 상품 조회
    const products = await this.productService.findManyByIds(uniqueProductIds);

    if (products.length !== uniqueProductIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missing = uniqueProductIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(
        `다음 상품이 존재하지 않습니다: ${missing.join(', ')}`,
      );
    }

    // 주문 금액 계산 및 요약 정보 구성
    const orderItems = request.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product)
        throw new NotFoundException(
          `상품 ${item.productId}을 찾을 수 없습니다`,
        );
      // const price = product.price;
      const totalPrice = new Decimal(product.price).mul(item.quantity);
      return {
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        totalPrice,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum.add(item.totalPrice),
      new Decimal(0),
    );

    const mostExpensive = orderItems.reduce((max, item) => {
      return item.unitPrice > max.unitPrice ? item : max;
    }, orderItems[0]);

    const summaryTitle =
      orderItems.length === 1
        ? `${mostExpensive.name} ${mostExpensive.quantity}개`
        : `${mostExpensive.name} ${mostExpensive.quantity}개 외 ${orderItems.length - 1}건`;

    let order: Order | null = null;
    try {
      order = await this.prismaService.order.create({
        data: {
          userId: request.userId,
          status: OrderStatus.PENDING,
          totalAmount,
        },
      });

      const paymentResponse = await this.paymentServiceFactory
        .getProvider(request.pg)
        .requestPayment({
          successRedirectUrl: request.successRedirectUrl,
          failureRedirectUrl: request.successRedirectUrl,
          cancelRedirectUrl: request.cancelRedirectUrl,
          userId: request.userId,
          amount: totalAmount,
          productName: summaryTitle,
          paymentMethod: request.paymentMethod,
          orderId: order.id,
        } as CreatePaymentRequest);

      await this.prismaService.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentId: paymentResponse.paymentId,
        },
      });

      return paymentResponse;
    } catch (err) {
      this.logger.error(err);
      if (order?.id) {
        await this.prismaService.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.FAILED },
        });
      }
      throw err;
    }
  }

  // TODO: 완성 필요
  async getOrder(orderId: string) {
    return this.prismaService.order.findUnique({
      where: {
        id: orderId,
      },
    });
  }

  async retryPayment(orderId: string) {
    const order = await this.prismaService.order.findUnique({
      include: {
        payment: true,
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

    return this.paymentServiceFactory
      .getProvider(order.payment.pgProvider as PgProviderType)
      .getRedirectUrl(order.payment.id);
  }

  // TODO: 상세 구현
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

    const order = await this.prismaService.order.update({
      where: {
        id: orderId,
      },
      include: {
        orderItems: true,
      },
      data: {
        paidAmount: paidAmount,
        status: OrderStatus.PAID,
      },
    });

    const products: processProductRequest[] = order.orderItems.map((item) => {
      return {
        productId: item.productId,
        quantity: item.quantity,
      };
    });

    // 주문 상품 지급 절차
    await this.productService.processProducts(products);
  }

  // TODO: 상세 구현
  async cancelOrder(orderId: string, request: any) {
    const order = await this.prismaService.order.findUnique({
      include: {
        payment: true,
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
    // orderId를 통해 order의 진행 상태 및 환불 가능 여부 확인

    // 주문 상품 회수

    return this.paymentServiceFactory
      .getProvider(order.payment.pgProvider as PgProviderType)
      .cancelPayment(order.payment.id, request);
  }

  // TODO: 상세 구현
  async cancelOrderPartial(orderId: string, request: any) {
    const order = await this.prismaService.order.findUnique({
      include: {
        payment: true,
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

    // orderId를 통해 order의 진행 상태 및 환불 가능 여부 확인

    // 주문 상품 회수

    return this.paymentServiceFactory
      .getProvider(order.payment.pgProvider as PgProviderType)
      .cancelPaymentPartial(order.payment.id, request);
  }
}

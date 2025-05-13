import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { PgProvider } from 'src/payment/abstract-payment-service';
import { PaymentServiceFactory } from 'src/payment/payment-service.factory';
import { CreateOrderRequest } from './dto/create-order.request';

@Injectable()
export class OrderService {
  constructor(
    @Inject(forwardRef(() => PaymentServiceFactory))
    private readonly paymentServiceFactory: PaymentServiceFactory,
    private readonly prismaService: PrismaService,
  ) {}

  // TODO: 상세 구현
  async createOrder(request: CreateOrderRequest) {
    // const order = this.prismaService.order.create({
    //   data: {
    //     ...request,
    //     status: OrderStatus.PENDING,
    //   },
    // });

    // const payment = await this.paymentServiceFactory
    //   .getProvider()
    //   .requestPayment({});

    return {
      url: '',
    };
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
      .getProvider(order.payment.pgProvider as PgProvider)
      .getRedirectUrl(order.payment.id);
  }

  // TODO: 상세 구현
  async fulfillOrder(orderId: string) {
    const order = await this.prismaService.order.findUnique({
      include: {
        orderItems: true,
      },
      where: {
        id: orderId,
      },
    });

    if (!order || !order.orderItems || order.orderItems.length <= 0) {
      throw new NotFoundException(
        '주문 정보 또는 결제 정보를 찾을 수 없습니다',
      );
    }

    // 주문 상품 지급 절차
  }

  // TODO: 상세 구현
  async cancelOrder(orderId: string, reason?: string) {
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
      .getProvider(order.payment.pgProvider as PgProvider)
      .cancelPayment(order.payment.id, reason);
  }

  // TODO: 상세 구현
  async cancelOrderPartial(orderId: string, request: any, reason?: string) {
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
      .getProvider(order.payment.pgProvider as PgProvider)
      .cancelPaymentPartial(order.payment.id, request, reason);
  }
}

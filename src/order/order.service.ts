import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { PaymentServiceFactory } from 'src/payment/payment-service.factory';
import { CreateOrderRequest } from './dto/create-order.request';

@Injectable()
export class OrderService {
  constructor(
    @Inject(forwardRef(() => PaymentServiceFactory))
    private readonly paymentServiceFactory: PaymentServiceFactory,
    private readonly prismaService: PrismaService,
  ) {}

  async createOrder(request: CreateOrderRequest) {
    // const order = this.prismaService.order.create({
    //   data: {
    //     ...request,
    //     status: OrderStatus.PENDING,
    //   },
    // });
    // const paymentUrl = '';
    // const payment = await this.paymentService.create(
    //   {} as PayletterPaymentsRequestDto,
    // );
    // // TODO: 주문 생성 로직 구현
    // return payment.online_url;
  }

  async fulfillOrder(orderId: string) {}

  async cancelOrder(orderId: string, reason?: string) {
    // orderId를 통해 order의 진행 상태 및 환불 가능 여부 확인
    // 상품 지급 철회 절차
    // payment 서비스의 환불 호출
    // this.paymentServiceFactory.getProvider().cancelPayment()
  }

  async cancelOrderPartial() {}
}

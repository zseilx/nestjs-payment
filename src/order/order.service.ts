import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { PgProvider } from 'src/payment/abstract-payment-service';
import { PayletterPaymentsRequestDto } from 'src/payment/payletter/dto/payletter-payments.dto';
import { PaymentServiceFactory } from 'src/payment/payment-service.factory';
import { ProductService } from 'src/product/product.service';
import { CreateOrderRequest } from './dto/create-order.request';

@Injectable()
export class OrderService {
  constructor(
    @Inject(forwardRef(() => PaymentServiceFactory))
    private readonly paymentServiceFactory: PaymentServiceFactory,
    private readonly prismaService: PrismaService,
    private readonly productService: ProductService,
  ) {}

  // TODO: 상세 구현
  async createOrder(request: CreateOrderRequest) {
    const paymentRequest = new PayletterPaymentsRequestDto();

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
      return {
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        totalPrice: product.price * item.quantity,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    const mostExpensive = orderItems.reduce((max, item) => {
      return item.unitPrice > max.unitPrice ? item : max;
    }, orderItems[0]);

    const summaryTitle =
      orderItems.length === 1
        ? `${mostExpensive.name}`
        : `${mostExpensive.name} 외 ${orderItems.length - 1}건`;

    // 이후 로직에서 totalAmount, summaryTitle 사용 가능

    // const order = this.prismaService.order.create({
    //   data: {
    //     userId: 'test',
    //   },
    // });

    // const payment = await this.paymentServiceFactory
    //   .getProvider()
    //   .requestPayment(paymentRequest);

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

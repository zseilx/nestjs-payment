import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateOrderRequest } from './dto/create-order.request';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() request: CreateOrderRequest) {
    return this.orderService.createOrder(request);
    // 주문 및 결제 요청 처리
  }

  @Post('payment-callback')
  async handlePaymentCallback(@Body() body: any) {
    // PG사 결제 결과 콜백 처리
  }

  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string) {
    // 주문 상세 조회
  }

  @Post(':orderId/retry-payment')
  async retryPayment(@Param('orderId') orderId: string) {
    // 결제 재요청
  }

  @Post(':orderId/cancel')
  async cancelOrder(@Param('orderId') orderId: string) {
    // 결제 전 주문 취소
  }
}

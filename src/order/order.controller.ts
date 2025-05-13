import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateOrderRequest } from './dto/create-order.request';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() request: CreateOrderRequest) {
    return this.orderService.createOrder(request);
  }

  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string) {
    return this.orderService.getOrder(orderId);
  }

  @Post(':orderId/retry-payment')
  async retryPayment(@Param('orderId') orderId: string) {
    return this.orderService.retryPayment(orderId);
    // 결제 재요청
  }

  @Post(':orderId/cancel')
  async cancelOrder(@Param('orderId') orderId: string) {
    // 결제 전 주문 취소
  }
}

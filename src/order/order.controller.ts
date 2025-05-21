import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreatePaymentResponse } from 'src/payment/dto/create-payment.response';
import { CreateOrderRequest } from './dto/create-order.request';
import { OrderService } from './order.service';

@ApiTags('주문')
@ApiExtraModels(CreateOrderRequest, CreatePaymentResponse)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOkResponse({
    schema: { $ref: getSchemaPath(CreatePaymentResponse) },
  })
  @ApiOperation({ summary: '주문 생성' })
  @Post()
  async createOrder(@Body() request: CreateOrderRequest) {
    const user = {
      id: 'test',
      role: 'USER',
    };

    request.userId = user.id;

    return this.orderService.createOrder(request);
  }

  // @ApiOperation({ summary: '주문 목록' })
  // @Get()
  // async getOrders() {
  //   const user = {
  //     id: 'test',
  //     role: 'USER',
  //   };
  // }

  // @ApiOperation({ summary: '주문 상세 조회' })
  // @Get(':orderId')
  // async getOrder(@Param('orderId') orderId: string) {
  //   const user = {
  //     id: 'test',
  //     role: 'USER',
  //   };

  //   return this.orderService.getOrder(orderId);
  // }

  // @ApiOperation({ summary: '주문 결제 재시도' })
  // @Post(':orderId/retry-payment')
  // async retryPayment(@Param('orderId') orderId: string) {
  //   const user = {
  //     id: 'test',
  //     role: 'USER',
  //   };

  //   return this.orderService.retryPayment(orderId);
  //   // 결제 재요청
  // }

  // @ApiOperation({ summary: '주문 취소' })
  // @Post(':orderId/cancel')
  // async cancelOrder(@Param('orderId') orderId: string) {
  //   const user = {
  //     id: 'test',
  //     role: 'USER',
  //   };

  //   return this.orderService.cancelOrder(orderId, {});
  //   // 결제 전 주문 취소
  // }

  // @ApiOperation({ summary: '주문 부분 취소' })
  // @Post(':orderId/cancel/partial')
  // async cancelOrderPartial(@Param('orderId') orderId: string) {
  //   const user = {
  //     id: 'test',
  //     role: 'USER',
  //   };

  //   return this.orderService.cancelOrderPartial(orderId, {});
  // }
}

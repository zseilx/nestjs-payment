import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiOkPaginatedResponse } from 'src/config/method.decorator';
import { CancelOrderPartialRequest } from './dto/cancel-order-partial.request';
import { CreateOrderRequest } from './dto/create-order.request';
import { DetailOrderResponse } from './dto/detail-order.response';
import { ListOrderResponse } from './dto/list-order.response';
import { SearchOrderRequest } from './dto/search-order.request';
import { UpdateOrderRequest } from './dto/update-order.request';
import { OrderService } from './order.service';

@ApiTags('주문')
@ApiExtraModels(CreateOrderRequest, ListOrderResponse)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({
    summary: '주문 생성',
    description: '주문만 생성합니다. 결제는 별도 API를 사용하세요.',
  })
  @Post()
  async createOrder(@Body() request: CreateOrderRequest) {
    const user = {
      id: 'test',
      role: 'USER',
    };

    request.userId = user.id;

    return this.orderService.createOrder(request);
  }

  @ApiOperation({ summary: '주문 목록' })
  @ApiOkPaginatedResponse(ListOrderResponse)
  @Get()
  async getOrders(@Query() request: SearchOrderRequest) {
    const user = {
      id: 'test',
      role: 'USER',
    };

    request.userId = user.id;

    return this.orderService.findMany(request);
  }

  @ApiOperation({ summary: '주문 상세 조회' })
  @ApiOkResponse({ type: DetailOrderResponse })
  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string) {
    return this.orderService.getOrder(orderId);
  }

  @ApiOperation({
    summary: '주문 수정',
    description: '결제 대기 중인 주문의 상품/수량을 수정합니다.',
  })
  @ApiOkResponse({ type: DetailOrderResponse })
  @Put(':orderId')
  async updateOrder(
    @Param('orderId') orderId: string,
    @Body() request: UpdateOrderRequest,
  ) {
    const user = {
      id: 'test',
      role: 'USER',
    };

    request.userId = user.id;

    return this.orderService.updateOrder(orderId, request);
  }

  @ApiOperation({ summary: '주문 취소' })
  @Post(':orderId/cancel')
  async cancelOrder(@Param('orderId') orderId: string) {
    return this.orderService.cancelOrder(orderId);
  }

  @ApiOperation({ summary: '주문 부분 취소' })
  @Post(':orderId/cancel/partial')
  async cancelOrderPartial(
    @Param('orderId') orderId: string,
    @Body() request: CancelOrderPartialRequest,
  ) {
    return this.orderService.cancelOrderPartial(orderId, request);
  }
}

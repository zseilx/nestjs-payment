import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PgProviderType } from 'generated/prisma';
import { OrderService } from 'src/order/order.service';
import { ServerInitiatedPaymentRequestDto } from './dto/server-initiated-payment.request';
import { AbstractPaymentService } from './interfaces/abstract-payment-service';
import {
  IServerInitiatedPaymentService,
  PaymentFlowType,
} from './interfaces/payment-service.interface';
import { PaymentServiceFactory } from './payment-service.factory';
import { PgProviderPipe } from './pg-provider.pipe';

export const CALLBACK_URL_PREFIX = ':paymentId/callback/';
export const RETURN_URL_PREFIX = ':paymentId/return/';
export const CANCEL_URL_PREFIX = ':paymentId/cancel/';

@ApiTags('결제')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentServiceFactory: PaymentServiceFactory,
    private readonly orderService: OrderService,
  ) {}

  @ApiOperation({
    summary: '서버 이니시에이팅 결제 시작 (페이레터 방식)',
    description: '서버에서 결제 요청을 생성하고 리다이렉트 URL을 반환합니다.',
  })
  @Post(':pgProvider')
  async startServerInitiatedPayment(
    @Param('pgProvider', PgProviderPipe) pgProvider: PgProviderType,
    @Body() request: ServerInitiatedPaymentRequestDto,
  ) {
    const provider = this.paymentServiceFactory.getProvider(pgProvider);

    if (provider.getPaymentFlowType() !== PaymentFlowType.SERVER_INITIATED) {
      throw new Error(
        `${pgProvider}는 서버 이니시에이팅 방식을 지원하지 않습니다.`,
      );
    }

    const serverProvider = provider as IServerInitiatedPaymentService;
    return serverProvider.requestPayment(request);
  }

  // @ApiOperation({
  //   summary: '클라이언트 결제 준비 (토스/다날 방식)',
  //   description:
  //     '클라이언트에서 결제 위젯을 초기화하기 위한 정보를 반환합니다.',
  // })
  // @Post('client-initiated/prepare/:pgProvider')
  // async prepareClientInitiatedPayment(
  //   @Param('pgProvider', PgProviderPipe) pgProvider: PgProviderType,
  //   @Body() request: ClientInitiatedPrepareRequestDto,
  // ) {
  //   const provider = this.paymentServiceFactory.getProvider(pgProvider);

  //   if (provider.getPaymentFlowType() !== PaymentFlowType.CLIENT_INITIATED) {
  //     throw new Error(
  //       `${pgProvider}는 클라이언트 이니시에이팅 방식을 지원하지 않습니다.`,
  //     );
  //   }

  //   const clientProvider = provider as IClientInitiatedPaymentService;
  //   return clientProvider.preparePayment(request);
  // }

  // @ApiOperation({
  //   summary: '클라이언트 결제 확인 (토스/다날 방식)',
  //   description: '클라이언트에서 결제 완료 후 서버에서 최종 확인합니다.',
  // })
  // @Post('client-initiated/confirm/:pgProvider')
  // async confirmClientInitiatedPayment(
  //   @Param('pgProvider', PgProviderPipe) pgProvider: PgProviderType,
  //   @Body() request: ClientInitiatedConfirmRequestDto,
  // ) {
  //   const provider = this.paymentServiceFactory.getProvider(pgProvider);

  //   if (provider.getPaymentFlowType() !== PaymentFlowType.CLIENT_INITIATED) {
  //     throw new Error(
  //       `${pgProvider}는 클라이언트 이니시에이팅 방식을 지원하지 않습니다.`,
  //     );
  //   }

  //   const clientProvider = provider as IClientInitiatedPaymentService;
  //   return clientProvider.confirmPayment(request);
  // }

  @ApiOperation({ summary: '결제 후 처리 (콜백)' })
  @Post(`:paymentId/callback/:pgProvider`)
  async handleCallback(
    @Param('paymentId') paymentId: string,
    @Param('pgProvider', PgProviderPipe) pgProvider: PgProviderType,
    @Body() request: any,
  ): Promise<unknown> {
    const provider = this.paymentServiceFactory.getProvider(pgProvider);
    const abstractProvider = provider as AbstractPaymentService;
    return provider.handleCallback(
      paymentId,
      abstractProvider.transformCallbackData(request),
    );
  }

  @ApiOperation({ summary: '결제 후 처리 (리턴)' })
  @Post(`:paymentId/return/:pgProvider`)
  async handleReturn(
    @Param('paymentId') paymentId: string,
    @Param('pgProvider', PgProviderPipe) pgProvider: PgProviderType,
    @Res() res: Response,
    @Body() request: any,
  ) {
    const provider = this.paymentServiceFactory.getProvider(pgProvider);
    const abstractProvider = provider as AbstractPaymentService;
    const redirectUrl = await provider.handleReturn(
      paymentId,
      abstractProvider.transformReturnData(request),
    );

    res.redirect(redirectUrl);
  }

  @ApiOperation({ summary: '결제 취소 처리' })
  @Post(`:paymentId/cancel/:pgProvider`)
  async handleCancel(
    @Param('paymentId') paymentId: string,
    @Param('pgProvider', PgProviderPipe) pgProvider: PgProviderType,
    @Body() request: any,
  ): Promise<void> {
    const provider = this.paymentServiceFactory.getProvider(pgProvider);
    const abstractProvider = provider as AbstractPaymentService;
    await provider.handleCancel(
      paymentId,
      abstractProvider.transformCancelData(request),
    );
  }
}

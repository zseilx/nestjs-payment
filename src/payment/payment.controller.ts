import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PgProviderType } from 'generated/prisma';
import { PaymentServiceFactory } from './payment-service.factory';
import { PgProviderPipe } from './pg-provider.pipe';

export const CALLBACK_URL_PREFIX = ':paymentId/callback/';
export const RETURN_URL_PREFIX = ':paymentId/return/';
export const CANCEL_URL_PREFIX = ':paymentId/cancel/';

@ApiTags('결제')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentServiceFactory: PaymentServiceFactory) {}

  @ApiOperation({ summary: '결제 후 처리 (콜백)' })
  @Post(`:paymentId/callback/:pgProvider`)
  async handleCallback(
    @Param('paymentId') paymentId: string,
    @Param('pgProvider', PgProviderPipe) pgProvider: PgProviderType,
    @Body() request: any,
  ): Promise<unknown> {
    const provider = this.paymentServiceFactory.getProvider(pgProvider);
    return provider.handleCallback(
      paymentId,
      provider.transformCallbackData(request),
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
    const redirectUrl = await provider.handleReturn(
      paymentId,
      provider.transformReturnData(request),
    );

    res.redirect(redirectUrl);
  }

  @ApiOperation({ summary: '결제 취소 처리' })
  @Post(`:paymentId/cancel/:pgProvider`)
  async handleCancel(
    @Param('paymentId') paymentId: string,
    @Param('pgProvider', PgProviderPipe) pgProvider: PgProviderType,
    @Body() request: any,
  ) {
    const provider = this.paymentServiceFactory.getProvider(pgProvider);
    return provider.handleCancel(
      paymentId,
      provider.transformCancelData(request),
    );
  }
}

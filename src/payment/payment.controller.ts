import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @Post(`${CALLBACK_URL_PREFIX}:pgProvider`)
  handleCallback(
    @Param('paymentId') paymentId: string,
    @Param('pgProvider', PgProviderPipe) pgProvider: PgProviderType,
    @Body() request: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.paymentServiceFactory
      .getProvider(pgProvider)
      .handleCallback(request);
  }

  @ApiOperation({ summary: '결제 후 처리 (리턴)' })
  @Post(`${RETURN_URL_PREFIX}:pgProvider`)
  handleReturn(
    @Param('paymentId') paymentId: string,
    @Param('pgProvider', PgProviderPipe) pgProvider: PgProviderType,
    @Body() request: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.paymentServiceFactory
      .getProvider(pgProvider)
      .handleCallback(request);
  }

  @ApiOperation({ summary: '결제 후 처리 (리턴)' })
  @Post(`${CANCEL_URL_PREFIX}:pgProvider`)
  handleCancel(
    @Param('paymentId') paymentId: string,
    @Param('pgProvider', PgProviderPipe) pgProvider: PgProviderType,
    @Body() request: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.paymentServiceFactory
      .getProvider(pgProvider)
      .handleCallback(request);
  }
}

import { Body, Controller, Param, Post } from '@nestjs/common';
import { PgProvider } from './abstract-payment-service';
import { PaymentServiceFactory } from './payment-service.factory';
import { PgProviderPipe } from './pg-provider.pipe';

export const CALLBACK_URL_PREFIX = ':paymentId/callback/';
export const RETURN_URL_PREFIX = ':paymentId/return/';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentServiceFactory: PaymentServiceFactory) {}

  @Post(`${CALLBACK_URL_PREFIX}:pgProvider`)
  handleCallback(
    @Param('paymentId') paymentId: string,
    @Param('pgProvider', PgProviderPipe) pgProvider: PgProvider,
    @Body() request: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.paymentServiceFactory
      .getProvider(pgProvider)
      .handleCallback(request);
  }

  @Post(`${RETURN_URL_PREFIX}:pgProvider`)
  handleReturn(
    @Param('paymentId') paymentId: string,
    @Param('pgProvider', PgProviderPipe) pgProvider: PgProvider,
    @Body() request: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.paymentServiceFactory
      .getProvider(pgProvider)
      .handleCallback(request);
  }
}

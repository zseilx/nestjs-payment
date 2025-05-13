import { Body, Controller, Param, Post } from '@nestjs/common';
import { PgProvider } from './abstract-payment-service';
import { PaymentServiceFactory } from './payment-service.factory';
import { PgProviderPipe } from './pg-provider.pipe';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentServiceFactory: PaymentServiceFactory) {}

  @Post(':paymentId/callback/:pgProvider')
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

  @Post(':paymentId/return/:pgProvider')
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

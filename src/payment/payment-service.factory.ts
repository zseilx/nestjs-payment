import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AbstractPaymentService, PgProvider } from './abstract-payment-service';
import { PayletterService } from './payletter/payletter.service';

@Injectable()
export class PaymentServiceFactory {
  private readonly providers: Record<PgProvider, AbstractPaymentService>;

  constructor(
    @Inject(forwardRef(() => PayletterService)) payletter: PayletterService,
  ) {
    this.providers = {
      [PgProvider.PAYLETTER]: payletter,
    };
  }

  getProvider(pg: PgProvider): AbstractPaymentService {
    const provider = this.providers[pg];
    if (!provider) throw new Error(`Unsupported PG: ${pg}`);
    return provider;
  }
}

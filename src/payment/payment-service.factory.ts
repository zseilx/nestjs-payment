import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PgProviderType } from 'generated/prisma';
import { AbstractPaymentService } from './abstract-payment-service';
import { PayletterService } from './payletter/payletter.service';

@Injectable()
export class PaymentServiceFactory {
  private readonly providers: Record<PgProviderType, AbstractPaymentService>;

  constructor(
    @Inject(forwardRef(() => PayletterService)) payletter: PayletterService,
  ) {
    this.providers = {
      [PgProviderType.PAYLETTER]: payletter,
    };
  }

  getProvider(pg: PgProviderType): AbstractPaymentService {
    const provider = this.providers[pg];
    if (!provider) throw new Error(`Unsupported PG: ${pg}`);
    return provider;
  }
}

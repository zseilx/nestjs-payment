import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PgProviderType } from 'generated/prisma';
import { IPaymentService } from './interfaces/payment-service.interface';
import { PayletterService } from './payletter/payletter.service';

@Injectable()
export class PaymentServiceFactory {
  private readonly providers: Record<PgProviderType, IPaymentService>;

  constructor(
    @Inject(forwardRef(() => PayletterService)) payletter: PayletterService,
    // @Inject(forwardRef(() => TossService)) toss: TossService,
  ) {
    this.providers = {
      [PgProviderType.PAYLETTER]: payletter,
      // [PgProviderType.TOSS]: toss, // 토스는 아직 PgProviderType에 없음
    };
  }

  getProvider(pg: PgProviderType): IPaymentService {
    const provider = this.providers[pg];
    if (!provider) throw new Error(`Unsupported PG: ${pg}`);
    return provider;
  }
}

import { CreatePaymentRequest } from './dto/create-payment.request';
import { CreatePaymentResponse } from './dto/create-payment.response';

export enum PgProvider {
  PAYLETTER = 'PAYLETTER',
}

export abstract class AbstractPaymentService {
  protected readonly pgProvider: PgProvider;
  constructor() {}

  abstract requestPayment(
    request: CreatePaymentRequest,
  ): Promise<CreatePaymentResponse>;

  abstract cancelPayment(paymentId: string, reason?: string);

  abstract cancelPaymentPartial(
    paymentId: string,
    request: any,
    reason?: string,
  );

  abstract verifyCallback(callbackData: any);

  abstract handleCallback(callbackData: any);

  abstract handleReturn(returnData: any);

  abstract getRedirectUrl(paymentId: string): Promise<string> | string;
}

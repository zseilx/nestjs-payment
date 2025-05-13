export enum PgProvider {
  PAYLETTER = 'PAYLETTER',
}

export abstract class AbstractPaymentService {
  protected readonly pgProvider: PgProvider;
  constructor() {}

  abstract requestPayment(request: any);

  abstract cancelPayment(paymentId: string, reason?: string);

  abstract verifyCallback(callbackData: any);

  abstract handleCallback(callbackData: any);

  abstract handleReturn(returnData: any);

  abstract getRedirectUrl(paymentId: string);
}

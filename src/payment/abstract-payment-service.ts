export enum PgProvider {
  PAYLETTER = 'PAYLETTER',
}

export abstract class AbstractPaymentService {
  protected readonly pgProvider: PgProvider;
  constructor() {}

  abstract requestPayment(request: any);

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

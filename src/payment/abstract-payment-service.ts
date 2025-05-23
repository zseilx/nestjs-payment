import { plainToInstance } from 'class-transformer';
import { CreatePaymentRequest } from './dto/create-payment.request';
import { CreatePaymentResponse } from './dto/create-payment.response';

export abstract class AbstractPaymentService<
  TCallbackData extends new () => InstanceType<TCallbackData> = any,
  TReturnData extends new () => InstanceType<TReturnData> = any,
  TCancelData extends new () => InstanceType<TCancelData> = any,
  TCallbackResponse extends new () => InstanceType<TCallbackResponse> = any,
> {
  abstract requestPayment(
    request: CreatePaymentRequest,
  ): Promise<CreatePaymentResponse>;

  abstract cancelPayment(paymentId: string, reason?: string);

  abstract cancelPaymentPartial(
    paymentId: string,
    request: any,
    reason?: string,
  );

  abstract verifyCallback(
    callbackData: InstanceType<TCallbackData>,
  ): boolean | Promise<boolean>;

  abstract handleCallback(
    paymentId: string,
    callbackData: InstanceType<TCallbackData>,
  ): Promise<TCallbackResponse>;

  abstract handleReturn(
    paymentId: string,
    returnData: InstanceType<TReturnData>,
  ): Promise<string>;

  abstract handleCancel(
    paymentId: string,
    cancelData: InstanceType<TCancelData>,
  ): Promise<any>;

  // abstract getRedirectUrl(paymentId: string): Promise<string> | string;

  protected abstract getCallbackDtoClass(): TCallbackData;
  protected abstract getReturnDtoClass(): TReturnData;
  protected abstract getCancelDtoClass(): TCancelData;

  // 공통 변환 로직 구현
  transformCallbackData(
    data: Record<string, unknown>,
  ): InstanceType<TCallbackData> {
    return plainToInstance(this.getCallbackDtoClass(), data);
  }

  transformReturnData(
    data: Record<string, unknown>,
  ): InstanceType<TReturnData> {
    return plainToInstance(this.getReturnDtoClass(), data);
  }

  transformCancelData(
    data: Record<string, unknown>,
  ): InstanceType<TCancelData> {
    return plainToInstance(this.getCancelDtoClass(), data);
  }
}

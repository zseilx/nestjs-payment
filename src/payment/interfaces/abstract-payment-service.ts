import { plainToInstance } from 'class-transformer';
import { IPaymentService } from './payment-service.interface';

// 기본 추상 클래스 (공통 기능만 포함)
export abstract class AbstractPaymentService<
  TCallbackData extends new () => InstanceType<TCallbackData> = any,
  TReturnData extends new () => InstanceType<TReturnData> = any,
  TCancelData extends new () => InstanceType<TCancelData> = any,
> implements IPaymentService
{
  // 각 서비스에서 구현해야 하는 추상 메서드들
  abstract getPaymentFlowType(): import('./payment-service.interface').PaymentFlowType;
  abstract cancelPayment(
    paymentId: string,
    userId: string,
  ): string | Promise<string>;
  abstract cancelPaymentPartial(
    paymentId: string,
    userId: string,
    amount: import('generated/prisma/runtime/library').Decimal,
  ): string | Promise<string>;
  abstract verifyCallback(
    callbackData: InstanceType<TCallbackData>,
  ): boolean | Promise<boolean>;
  abstract handleCallback(
    paymentId: string,
    callbackData: InstanceType<TCallbackData>,
  ): Promise<any>;
  abstract handleReturn(
    paymentId: string,
    returnData: InstanceType<TReturnData>,
  ): Promise<string>;
  abstract handleCancel(
    paymentId: string,
    cancelData: InstanceType<TCancelData>,
  ): Promise<any>;

  // DTO 클래스 반환 메서드들
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

// 기존 타입들은 호환성을 위해 유지 (deprecated)
/** @deprecated Use interfaces from payment-service.interface.ts instead */
export enum PaymentFlowType {
  SERVER_INITIATED = 'SERVER_INITIATED',
  CLIENT_INITIATED = 'CLIENT_INITIATED',
}

/** @deprecated Use ServerInitiatedPrepareRequest instead */
export interface PreparePaymentRequest {
  userId: string;
  orderId: string;
  amount: import('generated/prisma/runtime/library').Decimal;
  vatAmount: import('generated/prisma/runtime/library').Decimal;
  productName: string;
  paymentMethod: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
  cancelRedirectUrl?: string;
}

/** @deprecated Use ServerInitiatedPrepareResponse instead */
export interface PreparePaymentResponse {
  paymentId: string;
  clientKey?: string;
  amount: number;
  orderId: string;
  customerName?: string;
  [key: string]: any;
}

/** @deprecated Use ClientInitiatedConfirmRequest instead */
export interface ConfirmPaymentRequest {
  paymentId: string;
  paymentKey?: string;
  transactionId?: string;
  amount: import('generated/prisma/runtime/library').Decimal;
  [key: string]: any;
}

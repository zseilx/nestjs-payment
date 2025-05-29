import { AbstractPaymentService } from './abstract-payment-service';
import {
  ClientInitiatedConfirmRequest,
  ClientInitiatedConfirmResponse,
  ClientInitiatedPrepareRequest,
  ClientInitiatedPrepareResponse,
  IClientInitiatedPaymentService,
  PaymentFlowType,
} from './payment-service.interface';

export abstract class ClientInitiatedPaymentService<
    TCallbackData extends new () => InstanceType<TCallbackData> = any,
    TReturnData extends new () => InstanceType<TReturnData> = any,
    TCancelData extends new () => InstanceType<TCancelData> = any,
  >
  extends AbstractPaymentService<TCallbackData, TReturnData, TCancelData>
  implements IClientInitiatedPaymentService
{
  getPaymentFlowType(): PaymentFlowType {
    return PaymentFlowType.CLIENT_INITIATED;
  }

  // 클라이언트 이니시에이팅 결제 준비 (각 PG사에서 구현)
  abstract preparePayment(
    request: ClientInitiatedPrepareRequest,
  ): Promise<ClientInitiatedPrepareResponse>;

  // 클라이언트 이니시에이팅 결제 확인 (각 PG사에서 구현)
  abstract confirmPayment(
    request: ClientInitiatedConfirmRequest,
  ): Promise<ClientInitiatedConfirmResponse>;
}

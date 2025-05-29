import { ServerInitiatedPaymentRequestDto } from '../dto/server-initiated-payment.request';
import { AbstractPaymentService } from './abstract-payment-service';
import {
  IServerInitiatedPaymentService,
  PaymentFlowType,
  ServerInitiatedPaymentResponse,
} from './payment-service.interface';

export abstract class ServerInitiatedPaymentService<
    TCallbackData extends new () => InstanceType<TCallbackData> = any,
    TReturnData extends new () => InstanceType<TReturnData> = any,
    TCancelData extends new () => InstanceType<TCancelData> = any,
  >
  extends AbstractPaymentService<TCallbackData, TReturnData, TCancelData>
  implements IServerInitiatedPaymentService
{
  getPaymentFlowType(): PaymentFlowType {
    return PaymentFlowType.SERVER_INITIATED;
  }

  // 서버 이니시에이팅 결제 요청 (각 PG사에서 구현)
  abstract requestPayment(
    request: ServerInitiatedPaymentRequestDto,
  ): Promise<ServerInitiatedPaymentResponse>;
}

import { Decimal } from 'generated/prisma/runtime/library';
import { ServerInitiatedPaymentRequestDto } from '../dto/server-initiated-payment.request';

// 기본 결제 서비스 인터페이스
export interface IPaymentService {
  // 결제 플로우 타입 반환
  getPaymentFlowType(): PaymentFlowType;

  // 결제 취소 (공통)
  cancelPayment(paymentId: string, userId: string): string | Promise<string>;

  // 부분 취소 (공통)
  cancelPaymentPartial(
    paymentId: string,
    userId: string,
    amount: Decimal,
  ): string | Promise<string>;

  // 콜백 검증 (공통)
  verifyCallback(callbackData: any): boolean | Promise<boolean>;

  // 콜백 처리 (공통)
  handleCallback(paymentId: string, callbackData: any): Promise<any>;

  // 리턴 처리 (공통)
  handleReturn(paymentId: string, returnData: any): Promise<string>;

  // 취소 처리 (공통)
  handleCancel(paymentId: string, cancelData: any): Promise<any>;
}

// 결제 플로우 타입
export enum PaymentFlowType {
  SERVER_INITIATED = 'SERVER_INITIATED',
  CLIENT_INITIATED = 'CLIENT_INITIATED',
}

// 서버 이니시에이팅 결제 요청
export interface ServerInitiatedPaymentRequest {
  successRedirectUrl: string;
  failureRedirectUrl: string;
  cancelRedirectUrl: string;
  userId: string;
  orderId: string;
  productName: string;
  amount: Decimal;
  vatAmount: Decimal;
  paymentMethod: string;
  receiptFlag?: 'Y' | 'N';
}

// 서버 이니시에이팅 결제 응답
export interface ServerInitiatedPaymentResponse {
  paymentId: string;
  onlineUrl?: string;
  mobileUrl?: string;
  refundableDate?: Date;
  [key: string]: any;
}

// 클라이언트 이니시에이팅 결제 준비 요청
export interface ClientInitiatedPrepareRequest {
  userId: string;
  orderId: string;
  amount: Decimal;
  vatAmount: Decimal;
  productName: string;
  paymentMethod: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
  cancelRedirectUrl?: string;
}

// 클라이언트 이니시에이팅 결제 준비 응답
export interface ClientInitiatedPrepareResponse {
  paymentId: string;
  clientKey?: string;
  amount: number;
  orderId: string;
  customerName?: string;
  [key: string]: any;
}

// 클라이언트 이니시에이팅 결제 확인 요청
export interface ClientInitiatedConfirmRequest {
  paymentId: string;
  paymentKey?: string;
  transactionId?: string;
  amount: Decimal;
  [key: string]: any;
}

// 클라이언트 이니시에이팅 결제 확인 응답
export interface ClientInitiatedConfirmResponse {
  success: boolean;
  message?: string;
}

// 서버 이니시에이팅 결제 서비스 인터페이스
export interface IServerInitiatedPaymentService extends IPaymentService {
  requestPayment(
    request: ServerInitiatedPaymentRequestDto,
  ): Promise<ServerInitiatedPaymentResponse>;
}

// 클라이언트 이니시에이팅 결제 서비스 인터페이스
export interface IClientInitiatedPaymentService extends IPaymentService {
  preparePayment(
    request: ClientInitiatedPrepareRequest,
  ): Promise<ClientInitiatedPrepareResponse>;

  confirmPayment(
    request: ClientInitiatedConfirmRequest,
  ): Promise<ClientInitiatedConfirmResponse>;
}

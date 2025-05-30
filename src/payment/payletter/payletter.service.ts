import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import * as crypto from 'crypto';
import { PaymentStatus, PgProviderType } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';
import { catchError, firstValueFrom } from 'rxjs';
import { AppConfigService } from 'src/config/app-config/app-config.service';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { OrderService } from 'src/order/order.service';
import { ServerInitiatedPaymentRequestDto } from '../dto/server-initiated-payment.request';
import {
  PaymentFlowType,
  ServerInitiatedPaymentRequest,
  ServerInitiatedPaymentResponse,
} from '../interfaces/payment-service.interface';
import { ServerInitiatedPaymentService } from '../interfaces/server-initiated-payment.service';
import { PayletterCancelRequest } from './dto/payletter-cancel.request';
import { PayletterFailureResponse } from './dto/payletter-failure-response';
import { PayletterPartialCancelRequest } from './dto/payletter-partial-cancel.request';
import { PayletterPaymentsSuccessResponse } from './dto/payletter-payments-success.response';
import { PayletterPaymentsApiRequest } from './dto/payletter-payments.request';
import {
  PayletterPaymentsCallbackSuccessResponseDto,
  PayletterPaymentsReturnSuccessResponseDto,
} from './dto/payletter-payments.response';
import {
  calculateRefundableDate,
  convertPaymentMethodToPayletter,
  PayletterPGCode,
} from './payletter-method.enum';

@Injectable()
export class PayletterService extends ServerInitiatedPaymentService<
  typeof PayletterPaymentsCallbackSuccessResponseDto,
  typeof PayletterPaymentsReturnSuccessResponseDto,
  typeof Object
> {
  private readonly logger = new Logger(PayletterService.name);
  private readonly PAYLETTER_API_URL: string;
  private readonly PAYLETTER_API_KEY: string;
  private readonly PAYLETTER_ID: string;
  private readonly SERVER_HOST: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    appConfigService: AppConfigService,
  ) {
    super();
    this.PAYLETTER_API_URL = appConfigService.get('PAYLETTER_API_URL');
    this.PAYLETTER_API_KEY = appConfigService.get('PAYLETTER_API_KEY');
    this.PAYLETTER_ID = appConfigService.get('PAYLETTER_ID');
    this.SERVER_HOST = appConfigService.get('SERVER_HOST');
  }

  protected getCallbackDtoClass() {
    return PayletterPaymentsCallbackSuccessResponseDto;
  }

  protected getReturnDtoClass() {
    return PayletterPaymentsReturnSuccessResponseDto;
  }

  protected getCancelDtoClass() {
    return Object;
  }

  getPaymentFlowType(): PaymentFlowType {
    return PaymentFlowType.SERVER_INITIATED;
  }

  async requestPayment(
    request: ServerInitiatedPaymentRequestDto,
  ): Promise<ServerInitiatedPaymentResponse> {
    // 주문 정보 조회 및 검증
    const order = await this.orderService.getOrder(request.orderId);
    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    if (order.userId !== request.userId) {
      throw new BadRequestException('주문자가 일치하지 않습니다.');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('결제 가능한 주문이 아닙니다.');
    }

    // 서버에서 검증된 금액으로 내부 요청 생성
    const validatedRequest: ServerInitiatedPaymentRequest = {
      ...request,
      amount: new Decimal(order.totalAmount),
      vatAmount: order.vatAmount
        ? new Decimal(order.vatAmount)
        : new Decimal(0),
    };

    const serviceName = '페이먼트 서비스';
    const payment = await this.prismaService.payment.create({
      data: {
        pgProvider: PgProviderType.PAYLETTER,
        amount: validatedRequest.amount,
        status: 'INITIATED',
        method: 'CARD',
        serviceName: serviceName,
        successRedirectUrl: validatedRequest.successRedirectUrl,
        failureRedirectUrl: validatedRequest.failureRedirectUrl,
        cancelRedirectUrl: validatedRequest.cancelRedirectUrl,
      },
    });

    const taxAmount =
      validatedRequest.vatAmount instanceof Decimal
        ? validatedRequest.vatAmount.toNumber()
        : null;

    const apiRequestData: PayletterPaymentsApiRequest = Object.assign(
      new PayletterPaymentsApiRequest(),
      {
        client_id: this.PAYLETTER_ID,
        return_url: `${this.SERVER_HOST}/payments/${payment.id}/return/payletter`,
        callback_url: `${this.SERVER_HOST}/payments/${payment.id}/callback/payletter`,
        cancel_url: `${this.SERVER_HOST}/payments/${payment.id}/cancel/payletter`,
        user_id: validatedRequest.userId,
        product_name: validatedRequest.productName,
        service_name: serviceName,
        amount: validatedRequest.amount.toNumber(),
        tax_amount: taxAmount,
        pgcode: convertPaymentMethodToPayletter(
          validatedRequest.paymentMethod as any,
        ),
        order_no: validatedRequest.orderId,
        receipt_flag: validatedRequest.receiptFlag || 'N',
      } as Partial<PayletterPaymentsApiRequest>,
    );

    const { data } = await firstValueFrom(
      this.httpService
        .request<PayletterPaymentsSuccessResponse>({
          method: 'POST',
          baseURL: `${this.PAYLETTER_API_URL}/v1.0/payments/request`,
          headers: {
            Authorization: `PLKEY ${this.PAYLETTER_API_KEY}`,
          },
          data: apiRequestData,
        })
        .pipe(
          catchError((error: AxiosError<PayletterFailureResponse>) => {
            const res = error.response?.data;
            throw new HttpException(
              `${res?.code}: ${res?.message}`,
              error.status || 400,
            );
          }),
        ),
    );

    await this.prismaService.payletterDetail.create({
      data: {
        paymentId: payment.id,
        ...apiRequestData.getCamelCase(),
      },
    });

    await this.prismaService.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        onlineUrl: data.online_url,
        mobileUrl: data.mobile_url,
      },
    });

    return {
      paymentId: payment.id,
      onlineUrl: data.online_url,
      mobileUrl: data.mobile_url,
      refundableDate:
        calculateRefundableDate(
          convertPaymentMethodToPayletter(
            validatedRequest.paymentMethod as any,
          ),
          new Date(),
        ) || undefined,
    };
  }

  async cancelPayment(paymentId: string, userId: string) {
    const payment = await this.prismaService.payment.findUnique({
      where: { id: paymentId },
      include: {
        payletterDetail: true,
      },
    });
    if (!payment || !payment.payletterDetail) {
      throw new NotFoundException('결제 정보를 찾을 수 없습니다');
    }

    const { data } = await firstValueFrom(
      this.httpService
        .request<PayletterPaymentsSuccessResponse>({
          method: 'POST',
          baseURL: `${this.PAYLETTER_API_URL}/v1.0/payments/cancel`,
          headers: {
            Authorization: `PLKEY ${this.PAYLETTER_API_KEY}`,
          },
          data: {
            pgcode: payment.payletterDetail.pgcode,
            client_id: this.PAYLETTER_ID,
            user_id: userId,
            tid: payment.payletterDetail.tid,
            ip_addr: '127.0.0.1', // TODO: 실제 IP 주소로 변경
          } as PayletterCancelRequest,
        })
        .pipe(
          catchError((error: AxiosError<PayletterFailureResponse>) => {
            const res = error.response?.data;
            throw new HttpException(
              `${res?.code}: ${res?.message}`,
              error.status || 400,
            );
          }),
        ),
    );

    await this.prismaService.payletterDetail.update({
      where: {
        paymentId,
      },
      data: {
        // 취소 처리 완료 - 필요시 특정 필드만 업데이트
      },
    });

    return 'success';
  }

  async cancelPaymentPartial(
    paymentId: string,
    userId: string,
    amount: Decimal,
  ) {
    const payment = await this.prismaService.payment.findUnique({
      where: { id: paymentId },
      include: {
        payletterDetail: true,
      },
    });
    if (!payment || !payment.payletterDetail) {
      throw new NotFoundException('결제 정보를 찾을 수 없습니다');
    }

    await firstValueFrom(
      this.httpService
        .request<PayletterPaymentsSuccessResponse>({
          method: 'POST',
          baseURL: `${this.PAYLETTER_API_URL}/v1.0/payments/cancel/partial`,
          headers: {
            Authorization: `PLKEY ${this.PAYLETTER_API_KEY}`,
          },
          data: {
            pgcode: payment.payletterDetail.pgcode,
            client_id: this.PAYLETTER_ID,
            user_id: userId,
            tid: payment.payletterDetail.tid,
            amount: amount.toNumber(),
            ip_addr: '127.0.0.1', // TODO: 실제 IP 주소로 변경
          } as PayletterPartialCancelRequest,
        })
        .pipe(
          catchError((error: AxiosError<PayletterFailureResponse>) => {
            const res = error.response?.data;
            throw new HttpException(
              `${res?.code}: ${res?.message}`,
              error.status || 400,
            );
          }),
        ),
    );

    return 'success';
  }

  private generatePayhash(
    userId: string,
    amount: string | number,
    tid: string,
  ): string {
    const hash = crypto.createHash('sha256');
    hash.update(userId + amount + tid + this.PAYLETTER_API_KEY);
    return hash.digest('hex');
  }

  verifyCallback(
    callbackData: PayletterPaymentsReturnSuccessResponseDto,
  ): boolean {
    // payhash가 없는 경우 (가상계좌 등)는 검증을 건너뜁니다
    if (
      callbackData.pgcode === PayletterPGCode.virtualaccount &&
      !callbackData.payhash
    ) {
      return true;
    }

    const calculatedHash = this.generatePayhash(
      callbackData.user_id,
      callbackData.amount.toString(),
      callbackData.tid,
    );

    return (
      calculatedHash.toLocaleLowerCase() ===
      callbackData.payhash.toLocaleLowerCase()
    );
  }

  async handleCallback(
    paymentId: string,
    callbackData: PayletterPaymentsCallbackSuccessResponseDto,
  ): Promise<{ code: number; message: string }> {
    try {
      this.logger.debug(callbackData);

      // payhash 검증
      const isValid = this.verifyCallback(callbackData);
      if (!isValid) {
        throw new Error('Invalid payhash');
      }

      await this.prismaService.payletterDetail.update({
        data: {
          ...callbackData.toCamelCase(),
        },
        where: {
          paymentId,
        },
      });

      await this.prismaService.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
        },
      });

      await this.orderService.fulfillOrder(
        callbackData.order_no,
        callbackData.amount,
      );

      return { code: 0, message: '성공' };
    } catch (err: unknown) {
      this.logger.error(err);
      return {
        code: 1,
        message: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  async handleReturn(
    paymentId: string,
    returnData: PayletterPaymentsReturnSuccessResponseDto,
  ): Promise<string> {
    try {
      // payhash 검증
      const isValid = this.verifyCallback(returnData);
      if (!isValid) {
        throw new Error('Invalid payhash');
      }

      const payment = await this.prismaService.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
        },
      });
      if (!payment) {
        throw new NotFoundException('잘못된 접근입니다');
      }

      await this.prismaService.payletterDetail.update({
        data: {
          ...returnData.toCamelCase(),
        },
        where: {
          paymentId,
        },
      });

      await this.orderService.fulfillOrder(
        returnData.order_no,
        returnData.amount,
      );

      return payment.successRedirectUrl;
    } catch (err: unknown) {
      this.logger.error(err);

      const payment = await this.prismaService.payment.findUnique({
        where: { id: paymentId },
      });
      if (!payment) {
        throw new NotFoundException('잘못된 접근입니다');
      }

      return payment.failureRedirectUrl;
    }
  }

  async handleCancel(paymentId: string, cancelData: any): Promise<any> {
    this.logger.debug(cancelData);
    await Promise.resolve(); // Make it async
  }

  getRedirectUrl() {
    return '';
  }
}

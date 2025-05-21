import { HttpService } from '@nestjs/axios';
import {
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { PgProviderType } from 'generated/prisma';
import { catchError, firstValueFrom } from 'rxjs';
import { AppConfigService } from 'src/config/app-config/app-config.service';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { OrderService } from 'src/order/order.service';
import { AbstractPaymentService } from '../abstract-payment-service';
import { CreatePaymentRequest } from '../dto/create-payment.request';
import {
  CALLBACK_URL_PREFIX,
  CANCEL_URL_PREFIX,
  RETURN_URL_PREFIX,
} from '../payment.controller';
import {
  PayletterPaymentsApiRequest,
  PayletterPaymentsFailureResponseDto,
  PayletterPaymentsSuccessResponseDto,
} from './dto/payletter-payments.dto';
import {
  PayletterPaymentsCallbackSuccessResponseDto,
  PayletterPaymentsReturnSuccessResponseDto,
} from './dto/payletter-payments.response';
import { convertPaymentMethodToPayletter } from './payletter-method.enum';

@Injectable()
export class PayletterService extends AbstractPaymentService {
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

  // async test() {
  //   const test = new PayletterPaymentsApiRequest();

  //   test.client_id = this.PAYLETTER_ID;

  //   test.pgcode = 'toss';
  //   test.user_id = 'asdzxcttttt';
  //   test.amount = 1;
  //   test.product_name = '테스트용 캐시 1원 충전';
  //   test.return_url = 'http://58.227.158.121:80/payments/return';
  //   test.callback_url = 'http://58.227.158.121:80/payments/callback';
  //   test.service_name = '토스 테스트';

  //   const { data } = await firstValueFrom(
  //     this.httpService
  //       .request<PayletterPaymentsSuccessResponseDto>({
  //         method: 'POST',
  //         baseURL: `${this.PAYLETTER_API_URL}/v1.0/payments/request`,
  //         headers: {
  //           Authorization: `PLKEY ${this.PAYLETTER_API_KEY}`,
  //         },
  //         data: {
  //           ...test,
  //         },
  //       })
  //       .pipe(
  //         catchError(
  //           (error: AxiosError<PayletterPaymentsFailureResponseDto>) => {
  //             const res = error.response?.data;
  //             throw new HttpException(
  //               `${res?.code}: ${res?.message}`,
  //               error.status || 400,
  //             );
  //           },
  //         ),
  //       ),
  //   );

  //   this.logger.log(data);
  // }

  async requestPayment(request: CreatePaymentRequest) {
    const apiRequestData: PayletterPaymentsApiRequest = Object.assign(
      new PayletterPaymentsApiRequest(),
      {
        client_id: this.PAYLETTER_ID,
        return_url: `${this.SERVER_HOST}/payments/${CALLBACK_URL_PREFIX}/payletter`,
        callback_url: `${this.SERVER_HOST}/payments/${RETURN_URL_PREFIX}/payletter`,
        cancel_url: `${this.SERVER_HOST}/payments/${CANCEL_URL_PREFIX}/payletter`,
        custom_parameter: JSON.stringify({
          successRedirectUrl: request.successRedirectUrl,
          failureRedirectUrl: request.failureRedirectUrl,
          cancelRedirectUrl: request.cancelRedirectUrl,
        }),
        user_id: request.userId,
        product_name: request.productName,
        amount: request.amount.toNumber(),
        pgcode: convertPaymentMethodToPayletter(request.paymentMethod),
        order_no: request.orderId,
      } as Partial<PayletterPaymentsApiRequest>,
    );

    const { data } = await firstValueFrom(
      this.httpService
        .request<PayletterPaymentsSuccessResponseDto>({
          method: 'POST',
          baseURL: `${this.PAYLETTER_API_URL}/v1.0/payments/request`,
          headers: {
            Authorization: `PLKEY ${this.PAYLETTER_API_KEY}`,
          },
          data: apiRequestData,
        })
        .pipe(
          catchError(
            (error: AxiosError<PayletterPaymentsFailureResponseDto>) => {
              const res = error.response?.data;
              throw new HttpException(
                `${res?.code}: ${res?.message}`,
                error.status || 400,
              );
            },
          ),
        ),
    );
    const payment = await this.prismaService.payment.create({
      data: {
        pgProvider: PgProviderType.PAYLETTER,
        amount: apiRequestData.amount,
        status: 'INITIATED',
        method: 'CARD',
        serviceName: apiRequestData.service_name || '페이먼트 서비스',
      },
    });

    await this.prismaService.payletterDetail.create({
      data: {
        paymentId: payment.id,
        ...apiRequestData.getCamelCase(),
      },
    });

    return {
      paymentId: payment.id,
      onlineUrl: data.online_url,
      mobileUrl: data.mobile_url,
    };
  }

  cancelPayment(paymentId: string, reason?: string) {
    // TODO: 결제 취소 구현
    throw new Error('Method not implemented.');
  }

  cancelPaymentPartial(paymentId: string, request: any, reason?: string) {}

  verifyCallback(callbackData: any) {
    // TODO: 콜백 검증 구현
    throw new Error('Method not implemented.');
  }

  async handleReturn(returnData: PayletterPaymentsReturnSuccessResponseDto) {
    const payletterDetail = this.prismaService.payletterDetail.update({
      data: {
        ...returnData.toCamelCase(),
      },
      where: {
        tid: returnData.tid,
      },
    });

    await this.orderService.fulfillOrder(
      returnData.order_no,
      returnData.amount,
    );
  }

  async handleCallback(
    callbackData: PayletterPaymentsCallbackSuccessResponseDto,
  ) {
    const payletterDetail = this.prismaService.payletterDetail.update({
      data: {
        ...callbackData.toCamelCase(),
      },
      where: {
        tid: callbackData.tid,
      },
    });

    await this.orderService.fulfillOrder(
      callbackData.order_no,
      callbackData.amount,
    );
  }

  getRedirectUrl(paymentId: string) {
    return '';
  }
}

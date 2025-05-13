import { HttpService } from '@nestjs/axios';
import {
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AppConfigService } from 'src/config/app-config/app-config.service';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { OrderService } from 'src/order/order.service';
import { AbstractPaymentService } from '../abstract-payment-service';
import {
  PayletterPaymentsFailureResponseDto,
  PayletterPaymentsRequestDto,
  PayletterPaymentsSuccessResponseDto,
} from './dto/payletter-payments.dto';
import {
  PayletterPaymentsCallbackSuccessResponseDto,
  PayletterPaymentsReturnSuccessResponseDto,
} from './dto/payletter-payments.response';

@Injectable()
export class PayletterService extends AbstractPaymentService {
  private readonly logger = new Logger(PayletterService.name);
  private readonly PAYLETTER_API_URL: string;
  private readonly PAYLETTER_API_KEY: string;
  private readonly PAYLETTER_ID: string;

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
  }

  async test() {
    const test = new PayletterPaymentsRequestDto();

    test.client_id = this.PAYLETTER_ID;

    test.pgcode = 'toss';
    test.user_id = 'asdzxcttttt';
    test.amount = 1;
    test.product_name = '테스트용 캐시 1원 충전';
    test.return_url = 'http://58.227.158.121:80/payments/return';
    test.callback_url = 'http://58.227.158.121:80/payments/callback';
    test.service_name = '토스 테스트';

    const { data } = await firstValueFrom(
      this.httpService
        .request<PayletterPaymentsSuccessResponseDto>({
          method: 'POST',
          baseURL: `${this.PAYLETTER_API_URL}/v1.0/payments/request`,
          headers: {
            Authorization: `PLKEY ${this.PAYLETTER_API_KEY}`,
          },
          data: {
            ...test,
          },
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

    this.logger.log(data);
  }

  async requestPayment(request: PayletterPaymentsRequestDto) {
    const { data } = await firstValueFrom(
      this.httpService
        .request<PayletterPaymentsSuccessResponseDto>({
          method: 'POST',
          baseURL: `${this.PAYLETTER_API_URL}/v1.0/payments/request`,
          headers: {
            Authorization: `PLKEY ${this.PAYLETTER_API_KEY}`,
          },
          data: {
            ...request,
          },
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

    return data;
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

  handleReturn(returnData: PayletterPaymentsReturnSuccessResponseDto) {
    throw new Error('Method not implemented.');
  }

  handleCallback(callbackData: PayletterPaymentsCallbackSuccessResponseDto) {
    // TODO: 결제 완료 후 상품 지급
    // this.orderService.fulfillOrder()
    throw new Error('Method not implemented.');
  }

  getRedirectUrl(paymentId: string) {
    return '';
  }
}

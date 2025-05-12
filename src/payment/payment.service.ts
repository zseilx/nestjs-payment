import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AppConfigService } from 'src/config/app-config/app-config.service';
import {
  PayletterPaymentsFailureResponseDto,
  PayletterPaymentsRequestDto,
  PayletterPaymentsSuccessResponseDto,
} from './dto/payletter-payments.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly PAYLETTER_API_URL: string;
  private readonly PAYLETTER_API_KEY: string;
  private readonly PAYLETTER_ID: string;
  constructor(
    private readonly httpService: HttpService,
    appConfigService: AppConfigService,
  ) {
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

  async cancel() {
    const requestData = {
      pgcode: 'kakaopay',
      client_id: this.PAYLETTER_ID,
      user_id: 'asdzxcttttt',
      tid: '',
    };

    const { data } = await firstValueFrom(
      this.httpService
        .request<PayletterPaymentsSuccessResponseDto>({
          method: 'POST',
          baseURL: `${this.PAYLETTER_API_URL}/v1.0/payments/request`,
          headers: {
            Authorization: `PLKEY ${this.PAYLETTER_API_KEY}`,
          },
          data: {
            ...requestData,
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
  }
}

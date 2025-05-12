import { Body, Controller, Logger, Post } from '@nestjs/common';
import {
  PayletterPaymentsCallbackResponseDto,
  PayletterPaymentsReturnSuccessResponseDto,
} from './dto/payletter-payments.response';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {
    // this. PAYLETTER_API_KEY = appConfigService.get()
  }

  @Post()
  async paymentRequest() {
    await this.paymentService.test();
  }

  @Post('return')
  returnCheck(@Body() body: PayletterPaymentsReturnSuccessResponseDto) {
    this.logger.debug('returnCheck');
    this.logger.log(body);

    return body;
  }

  @Post('callback')
  callbackCheckPost(@Body() body: PayletterPaymentsCallbackResponseDto) {
    this.logger.debug('callbackCheckPost');
    this.logger.log(body);

    return body;
  }

  @Post('cancel')
  async cancelPayments() {
    await this.paymentService.cancel();
  }
}

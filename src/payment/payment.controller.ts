import { Body, Controller, Get, Logger, Patch, Post } from '@nestjs/common';
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
  returnCheck(@Body() body: any) {
    this.logger.debug('returnCheck');
    this.logger.log(body);
    return body;
  }

  @Post('callback')
  callbackCheckPost(@Body() body: any) {
    this.logger.debug('callbackCheckPost');
    this.logger.log(body);
    return body;
  }

  @Get('callback')
  callbackCheckGet(@Body() body: any) {
    this.logger.debug('callbackCheckGet');
    this.logger.log(body);
    return body;
  }

  @Patch('callback')
  callbackCheckPatch(@Body() body: any) {
    this.logger.debug('callbackCheckPatch');
    this.logger.log(body);
    return body;
  }

  @Post('cancel')
  async cancelPayments() {
    await this.paymentService.cancel();
  }
}

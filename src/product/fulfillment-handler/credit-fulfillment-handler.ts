import { Injectable, Logger } from '@nestjs/common';
import { ProductFulfillmentHandler } from './product-fulfillment-handler.interface';

@Injectable()
export class CreditFulfillmentHandler implements ProductFulfillmentHandler {
  private readonly logger = new Logger(CreditFulfillmentHandler.name);

  async fulfill(productId: string, quantity: number): Promise<void> {
    this.logger.log(
      `크레딧 상품 이행 처리 중... productId: ${productId}, quantity: ${quantity}`,
    );
    // TODO: 실제 크레딧 지급 로직 구현
    // 1. 사용자의 크레딧 증가
    // 2. 지급 이력 기록
    // 3. 필요시 알림 발송
  }

  async refund(productId: string, quantity: number): Promise<void> {
    this.logger.log(
      `크레딧 상품 환불 처리 중... productId: ${productId}, quantity: ${quantity}`,
    );
    // TODO: 실제 크레딧 환불 로직 구현
    // 1. 사용자의 크레딧 차감
    // 2. 환불 이력 기록
    // 3. 필요시 알림 발송
  }
}

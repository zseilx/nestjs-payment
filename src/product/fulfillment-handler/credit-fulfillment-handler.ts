import { Injectable } from '@nestjs/common';
import { ProductFulfillmentHandler } from './product-fulfillment-handler.interface';

@Injectable()
export class CreditFulfillmentHandler implements ProductFulfillmentHandler {
  async fulfill(): Promise<void> {
    // 디지털 상품 즉시 지급 로직
    // 예: 캐시, 쿠폰, 포인트 등 즉시 지급
    console.log('디지털 상품 이행 처리 중...');
  }
}

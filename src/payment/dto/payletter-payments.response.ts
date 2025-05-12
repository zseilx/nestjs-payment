import { Optional } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CashReceipt {
  @ApiProperty({ description: '현금영수증 발행 번호' })
  cid: string;

  @ApiProperty({ description: '현금영수증 발행 결과 코드' })
  code: string;

  @ApiProperty({ description: '거래번호' })
  deal_no: string;

  @ApiProperty({ description: '발행 유형' })
  issue_type: string;

  @ApiPropertyOptional({ description: '메시지' })
  message?: string;

  @ApiProperty({ description: '현금영수증 발행자 식별번호' })
  payer_sid: string;

  @ApiProperty({ description: '현금영수증 유형' })
  type: string;
}

export class PayletterPaymentsReturnSuccessResponseDto {
  @ApiProperty({ description: '결제 고유번호' })
  tid: string;

  @ApiProperty({ description: '가맹점 주문번호' })
  cid: string;

  @ApiProperty({ description: '결제금액' })
  amount: string;

  @ApiProperty({ description: '비과세 금액' })
  taxfree_amount: string;

  @ApiProperty({ description: '부가세 금액' })
  tax_amount: string;

  @ApiProperty({ description: '미정산 금액' })
  nonsettle_amount: string;

  @ApiProperty({ description: '결제 해시값' })
  payhash: string;

  @ApiProperty({ description: '현금영수증 발행 가능 금액' })
  receipt_possible_amount: string;

  @ApiProperty({ description: '쿠폰 사용 금액' })
  coupon_amount: string;

  @ApiProperty({ description: '할인 금액' })
  discount_amount: string;

  @ApiProperty({ description: '일회용 컵 보증금' })
  disposable_cup_deposit: string;

  @ApiProperty({ description: '결제 수단 정보' })
  method_info: string;

  @ApiProperty({ description: '결제자 아이디' })
  user_id: string;

  @ApiProperty({ description: '결제수단 코드' })
  pgcode: string;

  @ApiProperty({ description: '결제 서비스명' })
  service_name: string;

  @ApiProperty({ description: '결제 상품명' })
  product_name: string;

  @ApiProperty({ description: '결제 완료 시간' })
  transaction_date: string;

  @ApiProperty({ description: '결과 코드' })
  code: string;

  @ApiProperty({ description: '결과 메시지' })
  message: string;
}

export class PayletterPaymentsReturnFailureResponseDto {
  @ApiProperty({ description: '결제 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '에러 코드' })
  error_code: string;

  @ApiProperty({ description: '에러 메시지' })
  error_msg: string;

  @ApiPropertyOptional({ description: '가맹점 주문번호' })
  @Optional()
  order_no?: string;

  @ApiPropertyOptional({ description: '결제수단 코드' })
  @Optional()
  pgcode?: string;

  @ApiPropertyOptional({ description: '가맹점이 전송한 임의의 값' })
  @Optional()
  custom_parameter?: string;
}

export class PayletterPaymentsCallbackResponseDto {
  @ApiProperty({ description: '결제금액' })
  amount: number;

  @ApiPropertyOptional({ description: '빌키' })
  billkey?: string;

  @ApiPropertyOptional({ description: '카드 코드' })
  card_code?: string;

  @ApiPropertyOptional({ description: '카드 정보' })
  card_info?: string;

  @ApiPropertyOptional({ type: CashReceipt })
  cash_receipt?: CashReceipt;

  @ApiProperty({ description: '가맹점 주문번호' })
  cid: string;

  @ApiProperty({ description: '쿠폰 사용 금액' })
  coupon_amount: number;

  @ApiProperty({ description: '할인 금액' })
  discount_amount: number;

  @ApiProperty({ description: '일회용 컵 보증금' })
  disposable_cup_deposit: number;

  @ApiPropertyOptional({ description: '국내/해외 구분' })
  domestic_flag?: string;

  @ApiPropertyOptional({ description: '할부 개월' })
  install_month?: string;

  @ApiProperty({ description: '결제 수단 정보' })
  method_info: string;

  @ApiProperty({ description: '미정산 금액' })
  nonsettle_amount: number;

  @ApiProperty({ description: '가맹점 주문번호' })
  order_no: string;

  @ApiPropertyOptional({ description: '결제 정보' })
  pay_info?: string;

  @ApiProperty({ description: '결제 해시값' })
  payhash: string;

  @ApiProperty({ description: '결제수단 코드' })
  pgcode: string;

  @ApiPropertyOptional({ description: '포인트 사용 여부' })
  pointuse_flag?: string;

  @ApiProperty({ description: '결제 상품명' })
  product_name: string;

  @ApiProperty({ description: '현금영수증 발행 가능 금액' })
  receipt_possible_amount: number;

  @ApiProperty({ description: '결제 서비스명' })
  service_name: string;

  @ApiProperty({ description: '부가세 금액' })
  tax_amount: number;

  @ApiProperty({ description: '비과세 금액' })
  taxfree_amount: number;

  @ApiProperty({ description: '결제 고유번호' })
  tid: string;

  @ApiProperty({ description: '결제 완료 시간' })
  transaction_date: string;

  @ApiProperty({ description: '결제자 아이디' })
  user_id: string;

  @ApiProperty({ description: '결제자 이름' })
  user_name: string;
}

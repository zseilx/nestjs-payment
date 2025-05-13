import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

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
  @IsOptional()
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

  @ApiProperty({ description: '결제 해시값' })
  payhash: string;

  @ApiProperty({ description: '할인 금액' })
  discount_amount: string;

  @ApiProperty({ description: '일회용 컵 보증금' })
  disposable_cup_deposit: string;

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

  @ApiProperty({ description: '결제자 이름' })
  user_name: string;

  @ApiPropertyOptional({ description: '빌키' })
  @IsOptional()
  billkey?: string;

  @ApiPropertyOptional({ description: '카드 코드' })
  @IsOptional()
  card_code?: string;

  @ApiPropertyOptional({ description: '카드 정보' })
  @IsOptional()
  card_info?: string;

  @ApiPropertyOptional({ description: '국내/해외 구분' })
  @IsOptional()
  domestic_flag?: string;

  @ApiPropertyOptional({ description: '할부 개월' })
  @IsOptional()
  install_month?: string;

  @ApiProperty({ description: '가맹점 주문번호' })
  order_no: string;

  @ApiPropertyOptional({ description: '결제 정보' })
  @IsOptional()
  pay_info?: string;

  @ApiPropertyOptional({ description: '포인트 사용 여부' })
  @IsOptional()
  pointuse_flag?: string;
}

export class PayletterPaymentsReturnFailureResponseDto {
  @ApiProperty({ description: '결제 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '에러 코드' })
  error_code: string;

  @ApiProperty({ description: '에러 메시지' })
  error_msg: string;

  @ApiPropertyOptional({ description: '가맹점 주문번호' })
  @IsOptional()
  order_no?: string;

  @ApiPropertyOptional({ description: '결제수단 코드' })
  @IsOptional()
  pgcode?: string;

  @ApiPropertyOptional({ description: '가맹점이 전송한 임의의 값' })
  @IsOptional()
  custom_parameter?: string;
}

export class PayletterPaymentsCallbackSuccessResponseDto extends PayletterPaymentsReturnSuccessResponseDto {
  @ApiProperty({ description: '결제 수단 정보' })
  method_info: string;

  @ApiProperty({ description: '쿠폰 사용 금액' })
  coupon_amount: string;

  @ApiProperty({
    description:
      'SSG페이, 네이버페이에서 충전형 포인트에 대한 현금영수증 발급가능 금액',
  })
  receipt_possible_amount: number;

  @ApiPropertyOptional({ type: CashReceipt })
  @IsOptional()
  cash_receipt?: CashReceipt;

  @ApiPropertyOptional({ description: '가상계좌 번호' })
  @IsOptional()
  account_no: string;

  @ApiPropertyOptional({ description: '가상계좌 입금자명' })
  @IsOptional()
  account_name: string;

  @ApiPropertyOptional({ description: '가상계좌 예금주명' })
  @IsOptional()
  account_holder: string;

  @ApiPropertyOptional({ description: '가상계좌 은행 코드' })
  @IsOptional()
  bank_code: string;

  @ApiPropertyOptional({ description: '가상계좌 은행명' })
  @IsOptional()
  bank_name: string;

  @ApiPropertyOptional({ description: '가상계좌 채번 승인번호' })
  @IsOptional()
  issue_tid: string;

  @ApiPropertyOptional({ description: '가상계좌 입금만료일 (ex: 20210808)' })
  @IsOptional()
  expire_date: string;

  @ApiPropertyOptional({ description: '가상계좌 만료시각 (ex: 1130)' })
  @IsOptional()
  expire_time: string;
}

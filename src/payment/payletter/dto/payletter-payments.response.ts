import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/client';
import { Transform, Type } from 'class-transformer';
import { IsDecimal, IsInt, IsOptional } from 'class-validator';

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

  toCamelCase() {
    return {
      cashReceiptCid: this.cid,
      cashReceiptCode: this.code,
      cashReceiptDealNo: this.deal_no,
      cashReceiptIssueType: this.issue_type,
      cashReceiptMessage: this.message,
      cashReceiptPayerSid: this.payer_sid,
      cashReceiptType: this.type,
    };
  }
}

export class PayletterPaymentsReturnSuccessResponseDto {
  @ApiProperty({ description: '결제 고유번호' })
  tid: string;

  @ApiProperty({ description: '가맹점 주문번호' })
  cid: string;

  @ApiProperty({ description: '결제금액' })
  @Type(() => Decimal)
  amount: Decimal;

  @ApiProperty({ description: '비과세 금액' })
  @Type(() => Decimal)
  @IsDecimal()
  taxfree_amount: Decimal;

  @ApiProperty({ description: '부가세 금액' })
  tax_amount: Decimal;

  @ApiProperty({ description: '결제 해시값' })
  payhash: string;

  @ApiProperty({ description: '일회용 컵 보증금' })
  @Type(() => Decimal)
  @IsDecimal()
  disposable_cup_deposit: Decimal;

  @ApiProperty({ description: '결제자 아이디' })
  user_id: string;

  @ApiProperty({ description: '결제수단 코드' })
  pgcode: string;

  @ApiProperty({ description: '결제 서비스명' })
  service_name: string;

  @ApiProperty({ description: '결제 상품명' })
  product_name: string;

  @ApiProperty({ description: '결제 완료 시각' })
  @Transform(({ value }: { value: string }) => {
    if (!value) return value;
    // "2025-05-22 14:14:53" -> "2025-05-22T14:14:53.000Z"
    const [date, time] = value.split(' ');
    return new Date(`${date}T${time}.000Z`).toISOString();
  })
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

  @ApiPropertyOptional({ description: '카드 정보' })
  @IsOptional()
  card_info?: string;

  @ApiPropertyOptional({ description: '국내/해외 구분' })
  @IsOptional()
  domestic_flag?: string;

  @ApiPropertyOptional({ description: '할부 개월' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  install_month?: number;

  @ApiProperty({ description: '가맹점 주문번호' })
  order_no: string;

  @ApiPropertyOptional({ description: '결제 정보' })
  @IsOptional()
  pay_info?: string;

  toCamelCase() {
    return {
      tid: this.tid,
      cid: this.cid,
      amount: this.amount,
      taxfreeAmount: this.taxfree_amount,
      taxAmount: this.tax_amount,
      payhash: this.payhash,
      disposableCupDeposit: this.disposable_cup_deposit,
      userId: this.user_id,
      pgcode: this.pgcode,
      serviceName: this.service_name,
      productName: this.product_name,
      transactionDate: this.transaction_date,
      code: this.code,
      message: this.message,
      userName: this.user_name,
      billkey: this.billkey,
      cardInfo: this.card_info,
      domesticFlag: this.domestic_flag,
      installMonth: this.install_month,
      orderNo: this.order_no,
      payInfo: this.pay_info,
    };
  }
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

  toCamelCase() {
    return {
      success: this.success,
      errorCode: this.error_code,
      errorMsg: this.error_msg,
      orderNo: this.order_no,
      pgcode: this.pgcode,
      customParameter: this.custom_parameter,
    };
  }
}

export class PayletterPaymentsCallbackSuccessResponseDto extends PayletterPaymentsReturnSuccessResponseDto {
  @ApiProperty({ description: '결제 수단 정보' })
  method_info: string;

  @ApiProperty({ description: '쿠폰 사용 금액' })
  @Type(() => Decimal)
  @IsDecimal()
  coupon_amount: Decimal;

  @ApiProperty({
    description:
      'SSG페이, 네이버페이에서 충전형 포인트에 대한 현금영수증 발급가능 금액',
  })
  @Type(() => Decimal)
  @IsDecimal()
  receipt_possible_amount: Decimal;

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

  toCamelCase() {
    const base = super.toCamelCase();
    return {
      ...base,
      methodInfo: this.method_info,
      couponAmount: this.coupon_amount,
      receiptPossibleAmount: this.receipt_possible_amount,
      accountNo: this.account_no,
      accountName: this.account_name,
      accountHolder: this.account_holder,
      bankCode: this.bank_code,
      bankName: this.bank_name,
      issueTid: this.issue_tid,
      expireDate: this.expire_date,
      expireTime: this.expire_time,

      ...this.cash_receipt?.toCamelCase(),
    };
  }
}

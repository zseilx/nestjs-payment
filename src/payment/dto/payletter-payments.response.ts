import { Optional } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PayletterPaymentsReturnSuccessResponseDto {
  @ApiProperty({ description: '결제 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '결제 고유번호' })
  tid: string;

  @ApiProperty({ description: '가맹점 주문번호' })
  order_no: string;

  @ApiProperty({ description: '결제금액' })
  amount: number;

  @ApiProperty({ description: '결제수단 코드' })
  pgcode: string;

  @ApiProperty({ description: '결제 상품명' })
  product_name: string;

  @ApiProperty({ description: '결제자 아이디' })
  user_id: string;

  @ApiProperty({ description: '결제자 이름' })
  user_name: string;

  @ApiProperty({ description: '결제 완료 시간' })
  paid_at: string;

  @ApiPropertyOptional({ description: '현금영수증 발행 여부' })
  @Optional()
  receipt_flag?: string;

  @ApiPropertyOptional({ description: '현금영수증 번호' })
  @Optional()
  receipt_no?: string;

  @ApiPropertyOptional({ description: '가맹점이 전송한 임의의 값' })
  @Optional()
  custom_parameter?: string;
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
  @ApiProperty({ description: '결제 고유번호' })
  tid: string;

  @ApiProperty({ description: '가맹점 주문번호' })
  order_no: string;

  @ApiProperty({ description: '결제금액' })
  amount: number;

  @ApiProperty({ description: '결제수단 코드' })
  pgcode: string;

  @ApiProperty({ description: '결제 상태' })
  status: string;

  @ApiProperty({ description: '결제 완료 시간' })
  paid_at: string;

  @ApiPropertyOptional({ description: '현금영수증 발행 여부' })
  @Optional()
  receipt_flag?: string;

  @ApiPropertyOptional({ description: '현금영수증 번호' })
  @Optional()
  receipt_no?: string;

  @ApiPropertyOptional({ description: '가맹점이 전송한 임의의 값' })
  @Optional()
  custom_parameter?: string;

  @ApiPropertyOptional({ description: '취소 여부' })
  @Optional()
  cancel_flag?: string;

  @ApiPropertyOptional({ description: '취소 시간' })
  @Optional()
  canceled_at?: string;

  @ApiPropertyOptional({ description: '취소 금액' })
  @Optional()
  canceled_amount?: number;

  @ApiPropertyOptional({ description: '부분 취소 여부' })
  @Optional()
  partial_cancel_flag?: string;

  @ApiPropertyOptional({ description: '부분 취소 가능 금액' })
  @Optional()
  partial_cancel_amount?: number;
}

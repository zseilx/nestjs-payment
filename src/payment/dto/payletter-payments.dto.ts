import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class PayletterPaymentsSuccessResponseDto {
  token: number;
  online_url: string;
  mobile_url: string;
}
export class PayletterPaymentsFailureResponseDto {
  code: number;
  message: string;
}

export class PayletterPaymentsRequestDto {
  @ApiProperty({ description: '결제수단 코드' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  pgcode: string;

  @ApiProperty({ description: '가맹점 아이디' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  client_id: string;

  @ApiPropertyOptional({
    description: '결제 서비스명 (삼성페이, SSG페이는 필수)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  service_name?: string;

  @ApiProperty({ description: '가맹점 결제자(회원) 아이디' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  user_id: string;

  @ApiPropertyOptional({ description: '가맹점 결제자(회원) 이름' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  user_name?: string;

  @ApiPropertyOptional({ description: '가맹점 주문번호' })
  @IsString()
  @IsOptional()
  @MaxLength(40)
  order_no?: string;

  @ApiProperty({ description: '결제금액' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ description: '비과세 금액' })
  @IsNumber()
  @IsOptional()
  taxfree_amount?: number;

  @ApiPropertyOptional({ description: '부가세 금액' })
  @IsNumber()
  @IsOptional()
  tax_amount?: number;

  @ApiProperty({ description: '결제 상품(컨텐츠)명' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  product_name: string;

  @ApiPropertyOptional({
    description: '결제내역 메일 수신 여부 (Y:사용, N:미사용)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1)
  email_flag?: string;

  @ApiPropertyOptional({ description: '결제내역 메일 수신 주소' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  email_addr?: string;

  @ApiPropertyOptional({ description: '자동결제 여부 (Y:사용, N:미사용)' })
  @IsString()
  @IsOptional()
  @MaxLength(1)
  autopay_flag?: string;

  @ApiPropertyOptional({
    description: '현금영수증 입력 창 노출 여부 (Y:사용, N:미사용)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1)
  receipt_flag?: string;

  @ApiPropertyOptional({ description: '신용카드 수기결제 여부' })
  @IsString()
  @IsOptional()
  @MaxLength(1)
  keyin_flag?: string;

  @ApiPropertyOptional({ description: '가맹점이 전송하는 임의의 값' })
  @IsString()
  @IsOptional()
  @MaxLength(1024)
  custom_parameter?: string;

  @ApiProperty({ description: '결제 완료 후 연결할 웹 페이지 URL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  return_url: string;

  @ApiProperty({ description: '결제 성공 결과를 수신할 callback URL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  callback_url: string;

  @ApiPropertyOptional({ description: '취소 버튼 클릭시 연결할 웹 페이지 URL' })
  @IsString()
  @IsOptional()
  @MaxLength(256)
  cancel_url?: string;

  @ApiPropertyOptional({ description: 'In-app 사용 여부 (Y:사용, N:미사용)' })
  @IsString()
  @IsOptional()
  @MaxLength(1)
  inapp_flag?: string;

  @ApiPropertyOptional({
    description: 'In-app 에서 ISP / KFTC(계좌이체)결제시 연결할 앱 스키마',
  })
  @IsString()
  @IsOptional()
  @MaxLength(256)
  app_return_url?: string;

  @ApiPropertyOptional({
    description:
      'In-app 에서 ISP / KFTC(계좌이체)결제 취소(중단)시 연결할 앱 스키마',
  })
  @IsString()
  @IsOptional()
  @MaxLength(256)
  app_cancel_url?: string;

  @ApiPropertyOptional({ description: '가상계좌 채번시 만료일 설정(YYYYMMDD)' })
  @IsString()
  @IsOptional()
  @MaxLength(8)
  expire_date?: string;

  @ApiPropertyOptional({ description: '가상계좌 채번시 만료시각 설정(HHMM)' })
  @IsString()
  @IsOptional()
  @MaxLength(4)
  expire_time?: string;

  @ApiPropertyOptional({ description: '일회용 컵 보증금' })
  @IsNumber()
  @IsOptional()
  disposable_cup_deposit?: number;

  @ApiPropertyOptional({
    description:
      '카드사 인증창 내 가맹점명 노출 여부 (Y:노출, N: Payletter 노출)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1)
  company_name_flag?: string;
}

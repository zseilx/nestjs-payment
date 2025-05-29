import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { PaymentMethod } from 'generated/prisma';

export class ServerInitiatedPaymentRequestDto {
  @ApiProperty({
    description: '결제 성공 시 redirect url',
    example: 'http://localhost:3000/success',
  })
  @IsUrl({ require_tld: false, allow_underscores: true })
  @IsNotEmpty()
  successRedirectUrl: string;

  @ApiProperty({
    description: '결제 실패 시 redirect url',
    example: 'http://localhost:3000/failure',
  })
  @IsUrl({ require_tld: false, allow_underscores: true })
  @IsNotEmpty()
  failureRedirectUrl: string;

  @ApiProperty({
    description: '결제 취소 시 redirect url',
    example: 'http://localhost:3000/cancel',
  })
  @IsUrl({ require_tld: false, allow_underscores: true })
  @IsNotEmpty()
  cancelRedirectUrl: string;

  @ApiProperty({ description: '유저 아이디' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: '주문 아이디' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    description: '결제 상품 이름',
  })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ description: '결제 수단', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: '영수증 발행 여부', enum: ['Y', 'N'] })
  @IsOptional()
  @IsEnum(['Y', 'N'])
  receiptFlag?: 'Y' | 'N';
}

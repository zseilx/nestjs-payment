import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';
import { PaymentMethod } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';

export class CreatePaymentRequest {
  @ApiProperty({
    description: '결제 성공 시 redirect url',
    example: 'http://localhost',
  })
  @IsUrl()
  @IsNotEmpty()
  successRedirectUrl: string;

  @ApiProperty({
    description: '결제 실패 시 redirect url',
    example: 'http://localhost',
  })
  @IsUrl()
  @IsNotEmpty()
  failureRedirectUrl: string;

  @ApiProperty({
    description: '결제 취소 시 redirect url',
    example: 'http://localhost',
  })
  @IsUrl()
  @IsNotEmpty()
  cancelRedirectUrl: string;

  @ApiProperty({ description: '유저 아이디' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: '주문 아이디(번호)' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    description: '결제 상품 이름',
  })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({
    description: '결제 금액',
  })
  @Type(() => Decimal)
  @IsDecimal()
  amount: Decimal;

  @ApiProperty({ description: '결제 수단', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

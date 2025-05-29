import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Decimal } from 'generated/prisma/runtime/library';

export class ClientInitiatedPrepareRequestDto {
  @ApiProperty({ description: '유저 아이디' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: '주문 아이디' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    description: '결제 금액',
  })
  @Type(() => Decimal)
  @IsDecimal()
  amount: Decimal;

  @ApiProperty({
    description: '부가세 금액',
  })
  @Type(() => Decimal)
  @IsDecimal()
  vatAmount: Decimal;

  @ApiProperty({
    description: '결제 상품 이름',
  })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ description: '결제 수단' })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiPropertyOptional({
    description: '성공 리다이렉트 URL',
    example: 'http://localhost:3000/success',
  })
  @IsOptional()
  @IsUrl()
  successRedirectUrl?: string;

  @ApiPropertyOptional({
    description: '실패 리다이렉트 URL',
    example: 'http://localhost:3000/failure',
  })
  @IsOptional()
  @IsUrl()
  failureRedirectUrl?: string;

  @ApiPropertyOptional({
    description: '취소 리다이렉트 URL',
    example: 'http://localhost:3000/cancel',
  })
  @IsOptional()
  @IsUrl()
  cancelRedirectUrl?: string;
}

export class ClientInitiatedConfirmRequestDto {
  @ApiProperty({ description: '결제 아이디' })
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @ApiPropertyOptional({ description: '토스 결제 키' })
  @IsOptional()
  @IsString()
  paymentKey?: string;

  @ApiPropertyOptional({ description: '다날 트랜잭션 아이디' })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({
    description: '결제 금액',
  })
  @Type(() => Decimal)
  @IsDecimal()
  amount: Decimal;
}

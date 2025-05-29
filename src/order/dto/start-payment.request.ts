import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PaymentMethod, PgProviderType } from 'generated/prisma';

export class StartPaymentRequest {
  @ApiProperty({
    description: 'PG 프로바이더',
    enum: PgProviderType,
    example: 'PAYLETTER',
  })
  @IsEnum(PgProviderType)
  @IsNotEmpty()
  pg: PgProviderType;

  @ApiProperty({
    description: '결제 수단',
    enum: PaymentMethod,
    example: 'CARD',
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: '성공 리다이렉트 URL (선택사항)',
    required: false,
    example: 'http://localhost:3000/success',
  })
  @IsString()
  successRedirectUrl?: string;

  @ApiProperty({
    description: '실패 리다이렉트 URL (선택사항)',
    required: false,
    example: 'http://localhost:3000/failure',
  })
  @IsString()
  failureRedirectUrl?: string;

  @ApiProperty({
    description: '취소 리다이렉트 URL (선택사항)',
    required: false,
    example: 'http://localhost:3000/cancel',
  })
  @IsString()
  cancelRedirectUrl?: string;
}

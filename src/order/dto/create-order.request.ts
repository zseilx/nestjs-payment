import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod, PgProviderType } from 'generated/prisma';

class OrderItemInput {
  @ApiProperty({ description: '상품 ID' })
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: '상품 주문 갯수' })
  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class CreateOrderRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId: string;

  @ApiProperty({
    description: '결제 성공 시 redirect url',
    example: 'http://localhost',
  })
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  successRedirectUrl: string;

  @ApiProperty({
    description: '결제 실패 시 redirect url',
    example: 'http://localhost',
  })
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  failureRedirectUrl: string;

  @ApiProperty({
    description: '결제 취소 시 redirect url',
    example: 'http://localhost',
  })
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  cancelRedirectUrl: string;

  @ApiPropertyOptional({ description: '원하는 PG사 선택' })
  @IsOptional()
  @IsEnum(PgProviderType)
  pg: PgProviderType = PgProviderType.PAYLETTER;

  @ApiProperty({
    description: '주문 상품 목록',
    type: OrderItemInput,
    isArray: true,
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];

  @ApiProperty({ description: '결제 수단', enum: PaymentMethod })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PgProvider } from 'src/payment/abstract-payment-service';
import { PayletterPGCode } from 'src/payment/payletter/payment-method.enum';

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
  @ApiProperty({
    description: '결제 성공 시 redirect url',
    example: 'http://localhost',
  })
  @IsString()
  @IsNotEmpty()
  successRedirectUrl: string;

  @ApiProperty({
    description: '결제 실패 시 redirect url',
    example: 'http://localhost',
  })
  @IsString()
  @IsNotEmpty()
  failureRedirectUrl: string;

  @ApiPropertyOptional({ description: '원하는 PG사 선택' })
  @IsOptional()
  @IsEnum(PgProvider)
  pg: PgProvider = PgProvider.PAYLETTER;

  @ApiProperty({ description: '결제수단 코드' })
  @IsIn([PayletterPGCode])
  @IsNotEmpty()
  pgcode: PayletterPGCode;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];

  @IsNotEmpty()
  // TODO: Enum으로 변경
  // @IsEnum()
  @IsIn(['CARD', 'BANK_TRANSFER', 'VIRTUAL_ACCOUNT'])
  paymentMethod: string;
}

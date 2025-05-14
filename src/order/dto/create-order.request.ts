import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PayletterPGCode } from 'src/payment/payletter/payment-method.enum';

class OrderItemInput {
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class CreateOrderRequest {
  @ApiProperty({
    description: '결제 성공 시 redirect url',
  })
  @IsString()
  @IsNotEmpty()
  successRedirectUrl?: string;

  @ApiProperty({
    description: '결제 실패 시 redirect url',
  })
  @IsString()
  @IsNotEmpty()
  failureRedirectUrl?: string;

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

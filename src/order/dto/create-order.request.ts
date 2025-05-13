import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  ValidateNested,
} from 'class-validator';

class OrderItemInput {
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class CreateOrderRequest {
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

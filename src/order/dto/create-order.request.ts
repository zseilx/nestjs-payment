import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

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
  @ApiPropertyOptional({
    description: '사용자 ID',
    example: 'test',
  })
  @IsOptional()
  @IsString()
  userId: string;

  @ApiProperty({
    description: '주문 상품 목록',
    type: OrderItemInput,
    isArray: true,
    example: [
      {
        productId: 'cmaz4jvh10000yazyy2gzkxkp',
        quantity: 50,
      },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  orderItems: OrderItemInput[];
}

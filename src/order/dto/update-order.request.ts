import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateOrderItemRequest {
  @ApiProperty({
    description: '상품 ID',
    example: 'prod_123456',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: '수량',
    example: 2,
    minimum: 1,
  })
  @IsPositive()
  quantity: number;
}

export class UpdateOrderRequest {
  @ApiProperty({
    description: '주문 아이템 목록',
    type: [UpdateOrderItemRequest],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemRequest)
  orderItems: UpdateOrderItemRequest[];

  // 내부적으로 설정되는 필드
  userId?: string;
}

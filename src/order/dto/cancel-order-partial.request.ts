import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CancelOrderPartialItemRequest {
  @ApiProperty({
    description: '상품 ID',
    example: 'prod_123456',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: '취소 수량',
    example: 1,
  })
  @IsNumber()
  quantity: number;
}

export class CancelOrderPartialRequest {
  @ApiProperty({
    description: '취소 사유',
    example: '취소 사유',
  })
  reason: string;

  @ApiProperty({
    description: '취소 상품 목록',
    type: CancelOrderPartialItemRequest,
    isArray: true,
    example: [
      {
        productId: 'cmaz4jvh10000yazyy2gzkxkp',
        quantity: 30,
      },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CancelOrderPartialItemRequest)
  orderItems: CancelOrderPartialItemRequest[];
}

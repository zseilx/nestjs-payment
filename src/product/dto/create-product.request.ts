import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProductType } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';
import { IsDecimalLike } from 'src/config/custom-validator';

export class CreateProductRequest {
  @ApiProperty({
    description: '상품 이름',
    example: '상품 이름',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '상품 설명',
    example: '상품 설명',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '상품 가격 (원 단위, VAT 포함)',
    example: 10000,
  })
  @Type(() => Decimal)
  @IsDecimalLike()
  price: Decimal;

  @ApiProperty({
    description: '상품 이미지 URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: '통화 단위',
    enum: ['KRW'],
    default: 'KRW',
  })
  @IsIn(['KRW'])
  currency: string;

  @ApiProperty({
    description: '재고 수량',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({
    description: '상품 유형',
    enum: ProductType,
    example: ProductType.CREDIT,
  })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiProperty({
    description: '환불 가능 여부',
    required: true,
    example: true,
  })
  @IsBoolean()
  isRefundable: boolean;
}

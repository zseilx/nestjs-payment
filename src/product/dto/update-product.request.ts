import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ProductType } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';
import { IsDecimalLike } from 'src/config/custom-validator';

export class UpdateProductRequest {
  @ApiProperty({
    description: '상품 이름',
    example: '상품 이름',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: '상품 설명',
    example: '상품 설명',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '상품 가격 (원 단위, VAT 미포함)',
    example: 10000,
    required: false,
  })
  @IsOptional()
  @Type(() => Decimal)
  @IsDecimalLike()
  price?: Decimal;

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
    example: 'KRW',
    required: false,
  })
  @IsOptional()
  @IsIn(['KRW'])
  currency?: string;

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
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @ApiProperty({
    description: '판매 중지 여부',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: '환불 가능 여부',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRefundable?: boolean;

  @ApiProperty({
    description: '부가세 비율 (0.1=10%, 0=면세, 0.05=5% 등)',
    example: 0.1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  vatRate?: number;
}

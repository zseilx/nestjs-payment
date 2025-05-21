import { ApiProperty } from '@nestjs/swagger';
import { ProductType } from 'generated/prisma';

export class UpdateProductRequest {
  @ApiProperty({
    description: '상품 이름',
    example: '상품 이름',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: '상품 설명',
    example: '상품 설명',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: '상품 가격 (원 단위, VAT 포함)',
    example: 10000,
    required: false,
  })
  price?: number;

  @ApiProperty({
    description: '상품 이미지 URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    description: '통화 단위',
    example: 'KRW',
    required: false,
  })
  currency?: string;

  @ApiProperty({
    description: '재고 수량',
    example: 100,
    required: false,
  })
  stock?: number;

  @ApiProperty({
    description: '상품 유형',
    enum: ProductType,
    example: ProductType.CREDIT,
    required: false,
  })
  type?: ProductType;

  @ApiProperty({
    description: '판매 중지 여부',
    example: false,
    required: false,
  })
  isActive?: boolean;

  @ApiProperty({
    description: '환불 가능 여부',
    example: true,
    required: false,
  })
  isRefundable?: boolean;
}

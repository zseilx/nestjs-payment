import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductType } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';

export class ListProductResponse {
  @ApiProperty({
    description: '상품 ID',
    example: 'clg1234567890',
  })
  id: string;

  @ApiProperty({
    description: '상품 이름',
    example: '상품 이름',
  })
  name: string;

  @ApiProperty({
    description: '상품 설명',
    example: '상품 설명',
    required: false,
  })
  description: string | null;

  @ApiProperty({
    description: '상품 가격 (원 단위, VAT 미포함)',
    example: 10000,
  })
  @Type(() => Decimal)
  price: Decimal;

  @ApiProperty({
    description: '상품 이미지 URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  imageUrl: string | null;

  @ApiProperty({
    description: '통화 단위',
    example: 'KRW',
  })
  currency: string;

  @ApiProperty({
    description: '재고 수량',
    example: 100,
    required: false,
  })
  stock: number | null;

  @ApiProperty({
    description: '상품 유형',
    enum: ProductType,
    example: ProductType.CREDIT,
  })
  type: ProductType;

  @ApiProperty({
    description: '판매 중지 여부',
    example: false,
  })
  isActive: boolean;

  @ApiProperty({
    description: '환불 가능 여부',
    example: true,
  })
  isRefundable: boolean;

  @ApiProperty({
    description: '부가세 비율 (0.1=10%, 0=면세, 0.05=5% 등)',
    example: 0.1,
  })
  vatRate: number;

  @ApiProperty({
    description: 'VAT 포함 가격 (원 단위)',
    example: 11000,
  })
  @Type(() => Decimal)
  get priceIncludingVat(): Decimal {
    return new Decimal(this.price).mul(new Decimal(1).add(this.vatRate));
  }

  @ApiProperty({
    description: '생성일',
    example: '2024-03-20T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일',
    example: '2024-03-20T00:00:00.000Z',
  })
  updatedAt: Date;
}

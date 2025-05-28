import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from 'generated/prisma';

export class OrderItemDetailResponse {
  @ApiProperty({
    description: '주문 상품 ID',
    example: 'clg123456789',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: '상품 ID',
    example: 'prod_123456',
  })
  @IsString()
  productId: string;

  @Exclude()
  orderId: string;

  @ApiProperty({
    description: '주문 수량',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: '취소된 수량',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @IsPositive()
  canceledQty: number;

  @ApiProperty({
    description: '주문 당시 상품 단가',
    example: '10000',
  })
  @Type(() => Number)
  unitPrice: number;

  @ApiProperty({
    description: '주문 당시 상품명',
    example: '프리미엄 크레딧 100개',
  })
  @IsString()
  productName: string;

  @ApiProperty({
    description: '상품 옵션명',
    example: '색상: 블랙 / 사이즈: L',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  optionName?: string;

  @ApiProperty({
    description: '생성일시',
    example: '2024-03-20T12:00:00Z',
  })
  @IsDate()
  createdAt: Date;
}

export class DetailOrderResponse {
  @ApiProperty({ description: '주문 ID' })
  id: string;

  @ApiProperty({ description: '주문자 ID' })
  userId: string;

  @ApiProperty({ description: '주문 전체 금액 (정상가 * 수량 합)' })
  @Type(() => Number)
  totalAmount: number;

  @ApiProperty({
    description: '주문 상태',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiProperty({
    description: '실제 결제된 금액 (쿠폰, 포인트, 부분결제 반영)',
    nullable: true,
  })
  @Type(() => Number)
  paidAmount?: number | null;

  @ApiProperty({
    description: '부가세 금액',
    nullable: true,
  })
  @Type(() => Number)
  vatAmount?: number | null;

  @ApiProperty({
    description: '환불된 총 금액 (부분 환불 고려)',
    nullable: true,
  })
  @Type(() => Number)
  refundedAmount?: number | null;

  @ApiProperty({
    description: '결제 ID',
    nullable: true,
  })
  paymentId?: string | null;

  @ApiProperty({ description: '결제 일시', nullable: true })
  @Type(() => Date)
  paidAt: Date | null;

  @ApiProperty({ description: '환불 가능 일자', nullable: true })
  @Type(() => Date)
  refundableDate: Date | null;

  @ApiProperty({ description: '취소 일시', nullable: true })
  @Type(() => Date)
  canceledAt: Date | null;

  @ApiProperty({ description: '주문 생성일' })
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ description: '주문 수정일' })
  @Type(() => Date)
  updatedAt: Date;

  @ApiProperty({ description: '주문 상품 목록' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDetailResponse)
  orderItems: OrderItemDetailResponse[];
}

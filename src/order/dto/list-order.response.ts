import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrderStatus } from 'generated/prisma';

export class ListOrderResponse {
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
}

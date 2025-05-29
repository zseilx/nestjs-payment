import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreatePaymentResponse {
  @ApiProperty({
    description: 'PG사 구분',
    example: 'PAYLETTER',
  })
  pgProviderType: string;

  @ApiProperty({
    description: '결제 수단',
    example: 'KAKAO_PAY',
  })
  paymentMethod: string;

  @ApiProperty({
    description: '결제 아이디',
    example: '1234567890',
  })
  paymentId: string;

  @ApiProperty({
    description: '온라인 결제 링크',
    example: 'https://www.naver.com',
  })
  onlineUrl: string;

  @ApiProperty({
    description: '모바일 결제 링크',
    example: 'https://www.naver.com',
  })
  mobileUrl: string;

  @ApiPropertyOptional({
    description: '환불 가능 일자',
    example: '2025-05-27T14:14:53.000Z',
  })
  @IsOptional()
  refundableDate?: Date | null;
}

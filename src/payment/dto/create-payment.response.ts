import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentResponse {
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
}

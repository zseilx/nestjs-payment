import { ApiProperty } from '@nestjs/swagger';

export class CancelOrderRequest {
  @ApiProperty({
    description: '취소 사유',
    example: '취소 사유',
  })
  reason: string;
}

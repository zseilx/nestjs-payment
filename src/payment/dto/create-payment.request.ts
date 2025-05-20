import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentRequest {
  @ApiProperty({
    description: '결제 성공 시 redirect url',
    example: 'http://localhost',
  })
  @IsString()
  @IsNotEmpty()
  successRedirectUrl: string;

  @ApiProperty({
    description: '결제 실패 시 redirect url',
    example: 'http://localhost',
  })
  @IsString()
  @IsNotEmpty()
  failureRedirectUrl: string;
}

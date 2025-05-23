import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationOptions } from 'src/config/prisma/pagination';

export class SearchOrderRequest extends PaginationOptions {
  @ApiPropertyOptional({
    description: '검색 키워드',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: '유저 ID',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationOptions } from 'src/config/prisma/pagination';

export class SearchProductRequest extends PaginationOptions {
  @ApiPropertyOptional({
    description: '검색 키워드',
  })
  keyword?: string;
}

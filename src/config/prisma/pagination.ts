import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationOptions {
  @ApiPropertyOptional({ description: '페이지 번호' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: '한 페이지에 가져올 데이터 수',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take: number = 10;

  @ApiPropertyOptional({ description: '정렬 방식' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';
}

export class PagingInfo {
  @ApiProperty({ description: '전체 데이터 수' })
  totalRow: number;

  @ApiProperty({ description: '현재 페이지', example: 1 })
  currentPage: number;

  @ApiProperty({ description: '한 페이지에 가져오는 데이터 수', example: 20 })
  take: number;
}

export class PaginatedResult<T> {
  @ApiProperty({ description: '결과 데이터 리스트', isArray: true })
  list: T[];

  @ApiProperty({ description: '페이징 정보', type: PagingInfo })
  paging: PagingInfo;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface PaginationOptions {
  page?: number; // 현재 페이지 번호
  take?: number; // 한 페이지에 가져올 데이터 수
  order?: 'asc' | 'desc'; // 정렬 방식
}

export class PagingInfo {
  @ApiPropertyOptional({ description: '전체 데이터 수' })
  totalRow?: number;

  @ApiProperty({ description: '현재 페이지', example: 1 })
  currentPage: number;

  @ApiProperty({ description: '한 페이지에 가져오는 데이터 수', example: 20 })
  take: number;
}

export class PaginatedResult<T> {
  @ApiProperty({ description: '결과 데이터 리스트', isArray: true })
  data: T[];

  @ApiProperty({ description: '페이징 정보', type: PagingInfo })
  paging: PagingInfo;
}

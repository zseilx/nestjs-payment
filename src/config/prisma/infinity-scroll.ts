import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class InfinityScrollOptions<T = number | string | Date | null> {
  @ApiPropertyOptional({
    description: '커서 (이전 페이지의 마지막 항목 ID)',
    example: 'clg1234567890',
  })
  @IsOptional()
  @IsString()
  cursor: T;

  @ApiPropertyOptional({
    description: '페이지당 항목 수',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  take: number = 10;

  @ApiPropertyOptional({
    description: '정렬 방향',
    example: 'desc',
    default: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';
}

export class InfinityScrollInfo<T = number | string | Date> {
  @ApiProperty({
    description: '다음 페이지 커서',
    example: 'clg1234567890',
  })
  cursor: T;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
  })
  take: number;

  @ApiProperty({
    description: '전체 항목 수',
    example: 10,
  })
  totalRow: number;
}

export class InfinityScrollResult<T, D = number | string | Date> {
  @ApiProperty({
    description: '항목 목록',
    type: 'array',
    isArray: true,
  })
  list: T[];

  @ApiProperty({
    description: '페이지네이션 정보',
    type: InfinityScrollInfo<D>,
  })
  paging: InfinityScrollInfo<D>;
}

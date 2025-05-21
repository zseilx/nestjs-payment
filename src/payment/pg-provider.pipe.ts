import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { PgProviderType } from 'generated/prisma';

@Injectable()
export class PgProviderPipe implements PipeTransform {
  transform(value: string): PgProviderType {
    const key = value.toUpperCase() as keyof typeof PgProviderType;
    const pg = PgProviderType[key];
    if (!pg) throw new BadRequestException('Invalid PG provider');
    return pg;
  }
}

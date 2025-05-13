import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { PgProvider } from './abstract-payment-service';

@Injectable()
export class PgProviderPipe implements PipeTransform {
  transform(value: string): PgProvider {
    const key = value.toUpperCase() as keyof typeof PgProvider;
    const pg = PgProvider[key];
    if (!pg) throw new BadRequestException('Invalid PG provider');
    return pg;
  }
}

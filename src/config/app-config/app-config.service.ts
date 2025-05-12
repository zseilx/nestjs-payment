import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  private readonly logger = new Logger(AppConfigService.name);
  private readonly values: Record<string, string> = {};

  private readonly KEYS = [
    'ENV',
    'PORT',
    'DATABASE_URL',
    'PAYLETTER_API_KEY',
    'PAYLETTER_API_URL',
    'PAYLETTER_ID',
  ] as const;

  constructor(configService: ConfigService) {
    for (const key of this.KEYS) {
      // const value = configService.getOrThrow<string>(key);
      const value = configService.getOrThrow<string>(key);
      if (value.trim() === '') {
        throw new Error(
          `Environment variable "${key}" is required but was empty`,
        );
      }
      this.values[key] = value;
    }
    this.logger.log(`Loaded environment variable count: ${this.KEYS.length}`);
  }

  get(key: (typeof this.KEYS)[number]): string {
    return this.values[key];
  }
}

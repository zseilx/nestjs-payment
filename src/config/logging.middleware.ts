import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    this.logger.log(
      `[Request] ${req.ip} ${req.method} ${req.originalUrl} ${JSON.stringify(req.body)}`,
    );

    const start = Date.now();
    res.on('finish', () => {
      const elapsed = Date.now() - start;
      this.logger.log(
        `[Response] ${req.method} ${req.url} ${res.statusCode} - ${elapsed}ms`,
      );
    });

    next();
  }
}

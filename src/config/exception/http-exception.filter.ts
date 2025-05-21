import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const res = exception.getResponse();
    const status = exception.getStatus();

    let message = res ?? '';
    let error = exception.name ?? '';

    // 응답이 문자열이 아니라면 구조 안에서 message 추출
    if (res && typeof res === 'object') {
      message = (res as any).message ?? '';
      error = (res as any).error ?? error;
    }

    response.status(status).json({
      success: false,
      status,
      error,
      message,
    });
  }
}

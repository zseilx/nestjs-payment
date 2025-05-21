import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/client';
import { Response } from 'express';

// https://www.prisma.io/docs/orm/reference/error-reference
@Catch(
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  private handlers = new Map<
    new (...args: any[]) => Error,
    (e: any) => { status: number; message: string; error: string }
  >([
    [
      PrismaClientKnownRequestError,
      this.handlePrismaClientKnownRequestError.bind(this),
    ],
    [
      PrismaClientValidationError,
      this.handlePrismaClientValidationError.bind(this),
    ],
    [
      PrismaClientUnknownRequestError,
      this.handlePrismaClientUnknownRequestError.bind(this),
    ],
  ]);

  catch(
    exception:
      | PrismaClientKnownRequestError
      | PrismaClientValidationError
      | PrismaClientUnknownRequestError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    for (const [type, handler] of this.handlers.entries()) {
      if (exception instanceof type) {
        const { status, message, error } = handler(exception);
        this.createErrorResponse(response, status, error, message);
        return;
      }
    }

    // fallback 처리
    this.logger.error('Unhandled Prisma exception', exception);
    this.createErrorResponse(response, 500, '', '서버 에러입니다.');
  }

  private handlePrismaClientKnownRequestError(
    exception: PrismaClientKnownRequestError,
  ): { status: number; message: string; error: string } {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '서버 에러입니다';

    switch (exception.code) {
      case 'P2001':
      case 'P2015':
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = '요청한 데이터를 찾을 수 없습니다';
        break;
      default:
        this.logger.error(exception);
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = '서버 에러입니다';
        break;
    }

    return { status, message, error: exception.name ?? '' };
  }

  private handlePrismaClientValidationError(
    exception: PrismaClientValidationError,
  ): { status: number; message: string; error: string } {
    this.logger.warn('Prisma Validation error', exception.message);
    return {
      status: HttpStatus.BAD_REQUEST,
      error: exception.name,
      message: '잘못된 요청입니다',
    };
  }

  private handlePrismaClientUnknownRequestError(
    exception: PrismaClientUnknownRequestError,
  ): { status: number; message: string; error: string } {
    this.logger.error('Unknown Prisma request error', exception);
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: exception.name,
      message: '서버 에러입니다',
    };
  }

  private createErrorResponse(
    response,
    status: number,
    error: string,
    message: string | unknown,
  ) {
    response.status(status).json({
      success: false,
      status,
      error,
      message,
    });
  }
}

import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class TooManyRequestsException extends HttpException {
  constructor(message = '요청이 너무 많습니다.') {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message,
        error: 'Too Many Requests',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

export class PaymentRequiredException extends HttpException {
  constructor(message = '결제가 필요합니다.') {
    super(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        message,
        error: 'Payment Required',
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}

export class ValidationException extends HttpException {
  constructor(public readonly validationErrors: ValidationError[]) {
    const formattedErrors = validationErrors.map((error: ValidationError) => {
      return {
        property: error.property,
        message: error.constraints ? Object.values(error.constraints)[0] : [],
      };
    });
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'ValidationException',
        message: formattedErrors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

// export class ExcelValidationException extends HttpException {
//   constructor(public readonly validationErrors: ExcelValidationError[]) {
//     super(
//       {
//         statusCode: HttpStatus.BAD_REQUEST,
//         error: 'Excel Validation Failed',
//         message: validationErrors,
//       },
//       HttpStatus.BAD_REQUEST,
//     );
//   }
// }

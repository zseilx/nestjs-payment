import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { Decimal } from 'generated/prisma/runtime/library';

export function IsDecimalLike(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDecimalLike',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          try {
            new Decimal(value); // 변환 시도
            return true;
          } catch {
            return false;
          }
        },
        defaultMessage() {
          return 'price must be a valid decimal number';
        },
      },
    });
  };
}

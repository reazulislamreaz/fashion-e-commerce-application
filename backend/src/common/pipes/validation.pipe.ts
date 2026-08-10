import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

/**
 * Centralized request validation foundation (body, query, params via DTOs).
 */
export const defaultValidationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
};

export function createValidationPipe(
  options: ValidationPipeOptions = {},
): ValidationPipe {
  return new ValidationPipe({
    ...defaultValidationPipeOptions,
    ...options,
  });
}

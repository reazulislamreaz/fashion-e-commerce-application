import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AppHttpException } from '../errors/app.errors';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected internal server error occurred';
    let errors: unknown = null;
    let code: string | undefined;

    if (exception instanceof AppHttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as Record<string, unknown>;
      message =
        typeof res.message === 'string' ? res.message : exception.message;
      code = exception.code;
      errors = exception.details ?? null;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        if (Array.isArray(resObj.message)) {
          // Build a human-readable message from the validation error array
          const validationMessages = resObj.message.filter(
            (m: unknown): m is string => typeof m === 'string',
          );
          message =
            validationMessages.length > 0
              ? validationMessages.join('. ') +
                (validationMessages[validationMessages.length - 1].endsWith('.')
                  ? ''
                  : '.')
              : 'Validation failed. Please check your input and try again.';
          errors = resObj.message;
          code = 'VALIDATION_ERROR';
        } else if (typeof resObj.message === 'string') {
          message = resObj.message;
        } else {
          message = exception.message;
        }
      }

      if (status === 429 || message.includes('ThrottlerException')) {
        message = 'Too many requests. Please wait a moment before trying again.';
        code = 'TOO_MANY_REQUESTS';
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled Exception: ${exception.message}`,
        exception.stack,
      );
      message = isProduction
        ? 'An unexpected internal server error occurred'
        : exception.message;
    } else {
      this.logger.error('Unhandled non-error exception', String(exception));
    }

    response.status(status).json({
      success: false,
      message,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(code ? { code } : {}),
        ...(errors ? { errors } : {}),
      },
    });
  }
}

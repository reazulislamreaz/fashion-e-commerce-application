import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Application error foundation for consistent API failures.
 * Business modules in later phases should throw these (or Nest HttpExceptions).
 */
export class AppHttpException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(
      {
        message,
        error: code ?? HttpStatus[status],
        details,
      },
      status,
    );
  }
}

export class ValidationError extends AppHttpException {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppHttpException {
  constructor(message = 'Authentication required') {
    super(message, HttpStatus.UNAUTHORIZED, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppHttpException {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, HttpStatus.FORBIDDEN, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppHttpException {
  constructor(message = 'Resource not found') {
    super(message, HttpStatus.NOT_FOUND, 'NOT_FOUND');
  }
}

export class ConflictError extends AppHttpException {
  constructor(message = 'Resource conflict') {
    super(message, HttpStatus.CONFLICT, 'CONFLICT');
  }
}

export class DatabaseError extends AppHttpException {
  constructor(message = 'A database error occurred') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, 'DATABASE_ERROR');
  }
}

export class InternalServerError extends AppHttpException {
  constructor(message = 'An unexpected internal server error occurred') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR');
  }
}

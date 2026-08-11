import { Prisma } from '@prisma/client';
import { ConflictError } from '@/common/errors/app.errors';

export function isUniqueConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

export function isForeignKeyConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return (
      error.code === 'P2003' ||
      error.code === 'P2014' ||
      error.message?.includes('foreign key constraint') ||
      error.message?.includes('violates RESTRICT setting')
    );
  }
  if (error instanceof Error) {
    return (
      error.message?.includes('foreign key constraint') ||
      error.message?.includes('violates RESTRICT setting')
    );
  }
  return false;
}

export function throwConflictIfUnique(
  error: unknown,
  message: string,
): never {
  if (isUniqueConstraintError(error)) {
    throw new ConflictError(message);
  }
  throw error;
}

export function throwConflictIfReferenced(
  error: unknown,
  message: string,
): never {
  if (isForeignKeyConstraintError(error)) {
    throw new ConflictError(message);
  }
  throw error;
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/response.dto';

type WrappedResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
};

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map((res: T | WrappedResponse<T>) => {
        if (
          res &&
          typeof res === 'object' &&
          'success' in res &&
          'message' in res &&
          'data' in res
        ) {
          return res as ApiResponseDto<T>;
        }

        let message = 'Operation completed successfully';
        let data: T | null = res as T;
        let meta: Record<string, unknown> | undefined;

        if (res && typeof res === 'object') {
          const wrapped = res as WrappedResponse<T>;
          if (
            typeof wrapped.message === 'string' &&
            wrapped.data !== undefined
          ) {
            message = wrapped.message;
            data = wrapped.data ?? null;
            meta = wrapped.meta;
          } else if (
            wrapped.data !== undefined &&
            wrapped.meta !== undefined
          ) {
            data = wrapped.data ?? null;
            meta = wrapped.meta;
          }
        }

        return new ApiResponseDto(true, message, data, meta);
      }),
    );
  }
}

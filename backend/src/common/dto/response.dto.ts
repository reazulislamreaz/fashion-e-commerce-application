export class ApiResponseDto<T> {
  success: boolean;
  message: string;
  data: T | null;
  meta?: Record<string, unknown>;

  constructor(
    success: boolean,
    message: string,
    data: T | null = null,
    meta?: Record<string, unknown>,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }
}

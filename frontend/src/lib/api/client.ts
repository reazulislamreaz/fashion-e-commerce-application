import { env } from '@/lib/config/env';
import {
  ApiClientError,
  type ApiErrorResponse,
  type ApiResponse,
} from '@/lib/api/types';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
};

// Auth interceptor: called when a 401 is received on an authenticated request.
// Returns a new access token if refresh succeeded, or null if the session is dead.
type AuthInterceptor = () => Promise<string | null>;
let _authInterceptor: AuthInterceptor | null = null;

export function setAuthInterceptor(interceptor: AuthInterceptor | null) {
  _authInterceptor = interceptor;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${env.apiBaseUrl}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError('Invalid JSON response from API', response.status);
  }
}

async function executeRequest<T>(
  path: string,
  options: RequestOptions,
): Promise<{ response: Response; payload: ApiResponse<T>; url: string }> {
  const { body, query, headers, ...rest } = options;
  const url = buildUrl(path, query);

  const response = await fetch(url, {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await parseJson<T>(response);
  return { response, payload, url };
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  let { response, payload } = await executeRequest<T>(path, options);

  // If the request returned 401 and had a Bearer token, attempt a silent refresh.
  if (response.status === 401 && _authInterceptor) {
    const authHeader =
      (options.headers as Record<string, string>)?.Authorization ?? '';

    if (authHeader.startsWith('Bearer ')) {
      const newToken = await _authInterceptor();
      if (newToken) {
        // Retry with the refreshed token
        const retryOptions: RequestOptions = {
          ...options,
          headers: {
            ...(options.headers as Record<string, string>),
            Authorization: `Bearer ${newToken}`,
          },
        };
        const retry = await executeRequest<T>(path, retryOptions);
        response = retry.response;
        payload = retry.payload;
      }
    }
  }

  if (!response.ok || payload.success === false) {
    const errorBody = payload as ApiErrorResponse;
    throw new ApiClientError(
      errorBody.message || `Request failed with status ${response.status}`,
      response.status,
      errorBody.success === false ? errorBody : undefined,
    );
  }

  const metaPayload = payload as unknown as { meta?: { pagination?: Record<string, unknown> } };
  if (Array.isArray(payload.data) && metaPayload.meta?.pagination) {
    return {
      items: payload.data,
      pagination: {
        ...metaPayload.meta.pagination,
        totalItems: metaPayload.meta.pagination.totalItems ?? metaPayload.meta.pagination.total,
      },
    } as unknown as T;
  }

  if (payload.data !== undefined && payload.data !== null) {
    return payload.data;
  }

  return payload as unknown as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};

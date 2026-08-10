import { ApiClientError } from './types';

/**
 * Centralized error-message extractor for API and general errors.
 * Formats all technical, HTTP status, and validation errors into user-friendly copy.
 */
export function extractErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  let rawMessage = '';
  let status: number | undefined;

  if (error instanceof ApiClientError) {
    status = error.status;
    const meta = error.body?.meta;

    // Validation error details array
    if (meta?.errors && Array.isArray(meta.errors)) {
      const messages = (meta.errors as unknown[])
        .filter((m): m is string => typeof m === 'string')
        .map(capitalize);
      if (messages.length > 0) {
        return messages.join('. ') + (messages[messages.length - 1].endsWith('.') ? '' : '.');
      }
    }

    rawMessage = error.body?.message || error.message || '';
  } else if (error instanceof Error) {
    rawMessage = error.message;
  } else if (typeof error === 'string') {
    rawMessage = error;
  }

  // Handle Rate Limiting / 429 Too Many Requests
  if (
    status === 429 ||
    rawMessage.includes('ThrottlerException') ||
    rawMessage.toLowerCase().includes('too many requests')
  ) {
    return 'Too many requests. Please wait a moment before trying again.';
  }

  // Handle Network / Connection Errors
  if (
    rawMessage.includes('Failed to fetch') ||
    rawMessage.includes('NetworkError') ||
    rawMessage.includes('ECONNREFUSED')
  ) {
    return 'Unable to connect to the server. Please check your network connection.';
  }

  // Handle 500 / Internal Server Errors
  if (status && status >= 500) {
    return 'A temporary server error occurred. Please try again in a few moments.';
  }

  // Strip technical exception prefixes if present (e.g., "ThrottlerException: ")
  if (rawMessage.includes(': ')) {
    const parts = rawMessage.split(': ');
    if (parts[0].endsWith('Exception') || parts[0].endsWith('Error')) {
      rawMessage = parts.slice(1).join(': ');
    }
  }

  return rawMessage.trim() || fallback;
}

/** Capitalize the first letter of a string. */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

import { ApiClientError } from './types';

/**
 * Centralized error-message extractor for API and general errors.
 *
 * Prioritises:
 *  1. Joined validation-error strings from `body.meta.errors` (array)
 *  2. The top-level `body.message` (backend-provided human-readable message)
 *  3. The Error `message` property
 *  4. A user-friendly fallback
 */
export function extractErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error instanceof ApiClientError) {
    // The backend now sends joined validation messages as the top-level
    // message, but if for any reason validation detail strings are available
    // in `meta.errors`, prefer those for maximum specificity.
    const meta = error.body?.meta;
    if (meta?.errors && Array.isArray(meta.errors)) {
      const messages = (meta.errors as unknown[])
        .filter((m): m is string => typeof m === 'string')
        .map(capitalize);
      if (messages.length > 0) {
        return messages.join('. ') + (messages[messages.length - 1].endsWith('.') ? '' : '.');
      }
    }

    // Use the top-level API message (now human-readable after backend fix)
    if (error.body?.message) {
      return error.body.message;
    }

    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallback;
}

/** Capitalize the first letter of a string. */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

import { isAxiosError } from 'axios';

/** Reads HTTP status from an axios error or from `Error.cause` when wrapped. */
export function getHttpStatusFromError(error: unknown): number | undefined {
  if (isAxiosError(error)) {
    return error.response?.status;
  }

  if (error instanceof Error && error.cause !== undefined) {
    return getHttpStatusFromError(error.cause);
  }

  return undefined;
}

/** True when the request never received an HTTP response (offline, refused, or timed out). */
export function isNetworkError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
  }

  if (error instanceof Error && error.cause !== undefined) {
    return isNetworkError(error.cause);
  }

  return false;
}

/** True when the client gave up waiting for the backend (axios timeout or a wrapped timeout). */
export function isConnectionTimeout(error: unknown): boolean {
  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return true;
    return /timeout/i.test(error.message);
  }

  if (error instanceof Error) {
    if (/timeout/i.test(error.message)) return true;
    if (error.cause !== undefined) return isConnectionTimeout(error.cause);
  }

  return false;
}

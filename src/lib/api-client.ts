import axios, { isAxiosError } from 'axios';
import { authKeys } from '@/features/auth/api/query-keys';
import { clearAuthToken, getAuthToken } from '@/features/auth/lib/auth-token-store';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/router';
import { env } from './env';

export { getHttpStatusFromError } from './http-error';

export const apiClient = axios.create({
  baseURL: `${env.apiBaseUrl}/api`,
  timeout: 15000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(error);
    }

    const { status } = error.response;
    const requestUrl = String(error.config?.url ?? '');
    const isMeRequest = requestUrl === '/me' || requestUrl.endsWith('/me');

    if (status === 401) {
      clearAuthToken();
      queryClient.setQueryData(authKeys.me(), null);

      // Let route guards handle /me 401s so redirect search params are preserved.
      const pathname = window.location.pathname;
      const isPublicAuthPath = pathname === '/' || pathname === '/login';

      if (!isMeRequest && !isPublicAuthPath) {
        void router.navigate({ to: '/login', replace: true });
      }
    }

    return Promise.reject(error);
  },
);

type ApiErrorBody = {
  message?: string;
  error?: { message?: string };
};

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    if (typeof data?.error?.message === 'string') return data.error.message;
    if (typeof data?.message === 'string') return data.message;
  }

  if (error instanceof Error) return error.message;

  return fallback;
}

export default apiClient;

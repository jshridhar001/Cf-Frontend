import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getHttpStatusFromError } from '@/lib/http-error';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      successMessage?: string;
      suppressGlobalError?: boolean;
    };
  }
}

const isProduction = import.meta.env.MODE === 'production';

function shouldRetryRequest(failureCount: number, error: unknown, maxRetries: number) {
  const status = getHttpStatusFromError(error);
  if (status !== undefined && status >= 400 && status < 500) return false;
  return failureCount < maxRetries;
}

function getToastErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error && typeof error === 'object') {
    const maybe = error as { message?: string; error?: { message?: string } };
    const message = maybe.error?.message ?? maybe.message;
    if (typeof message === 'string' && message.length > 0) return message;
  }

  if (error instanceof Error && error.message) return error.message;

  return fallback;
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError(error, query) {
      // First-load errors are handled locally by the component's `isError` state.
      if (query.state.data === undefined) return;

      toast.error(getToastErrorMessage(error));
    },
  }),

  mutationCache: new MutationCache({
    onSuccess(_data, _variables, _context, mutation) {
      const successMessage = mutation.meta?.successMessage;
      if (successMessage) {
        toast.success(successMessage);
      }
    },
    onError(error, _variables, _context, mutation) {
      if (mutation.meta?.suppressGlobalError) return;
      toast.error(getToastErrorMessage(error));
    },
  }),

  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      retry: (failureCount, error) => shouldRetryRequest(failureCount, error, isProduction ? 3 : 1),
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    },

    mutations: {
      retry: (failureCount, error) => shouldRetryRequest(failureCount, error, 2),
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    },
  },
});

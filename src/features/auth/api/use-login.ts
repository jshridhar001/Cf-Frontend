import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { authClient } from '../lib/auth-client';
import type { LoginCredentials } from '../types';
import { meQueryOptions } from './use-me';

type LoginVariables = LoginCredentials & {
  redirectTo?: string;
};

function getSignInErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const maybe = error as {
      code?: string;
      message?: string;
      error?: { code?: string; message?: string };
    };
    const code = maybe.code ?? maybe.error?.code;
    const message = maybe.message ?? maybe.error?.message;

    if (code === 'INVALID_EMAIL_OR_PASSWORD') {
      return 'Invalid email or password';
    }
    if (code === 'EMAIL_NOT_VERIFIED') {
      return 'Email not verified. Please verify your email before signing in.';
    }
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Sign in failed. Please try again.';
}

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: async ({ email, password }: LoginVariables) => {
      const result = await authClient.signIn.email({ email, password });

      if (result.error) {
        throw result.error;
      }

      // Login page beforeLoad caches `me: null` within staleTime; force a
      // network refetch so the session is visible before navigating.
      await queryClient.fetchQuery({
        ...meQueryOptions(),
        staleTime: 0,
      });

      return result.data;
    },
    retry: false,
    meta: {
      successMessage: 'Signed in successfully.',
      suppressGlobalError: true,
    },
    onSuccess: async (_data, variables) => {
      if (variables.redirectTo) {
        await navigate({ href: variables.redirectTo, replace: true });
        return;
      }

      await navigate({ to: '/dashboard', replace: true });
    },
    onError: (error) => {
      toast.error(getSignInErrorMessage(error));
    },
  });
}

import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { ConnectionLoader } from '@/components/connection-status';
import { meQueryOptions } from '@/features/auth/api/use-me';
import { LoginForm } from '@/features/auth/components/login-form';

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  pendingComponent: ConnectionLoader,
  pendingMs: 0,
  pendingMinMs: 400,
  beforeLoad: async ({ context, search }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions());

    if (!me) return;

    if (search.redirect) {
      throw redirect({ href: search.redirect });
    }

    throw redirect({ to: '/dashboard' });
  },
  component: LoginForm,
});

import { createFileRoute, redirect } from '@tanstack/react-router';
import { ConnectionLoader } from '@/components/connection-status';
import { meQueryOptions } from '@/features/auth/api/use-me';
import { AuthenticatedLayout } from './_authenticated/-layout';

export const Route = createFileRoute('/_authenticated')({
  pendingComponent: ConnectionLoader,
  pendingMs: 0,
  pendingMinMs: 400,
  beforeLoad: async ({ context, location }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions());

    if (!me) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }

    return { me };
  },
  component: AuthenticatedLayout,
});

import { createFileRoute, redirect } from '@tanstack/react-router';
import { ConnectionLoader } from '@/components/connection-status';
import { meQueryOptions } from '@/features/auth/api/use-me';
import { StartScreen } from '@/features/auth/components/start-screen';

export const Route = createFileRoute('/')({
  pendingComponent: ConnectionLoader,
  pendingMs: 0,
  pendingMinMs: 400,
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions());

    if (me) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: StartScreen,
});

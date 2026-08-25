import { createFileRoute, redirect } from '@tanstack/react-router';
import { meQueryOptions } from '@/features/auth/api/use-me';
import { canAccessAdminRoutes } from '@/features/auth/lib/authorization';

export const Route = createFileRoute('/_authenticated/master')({
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions());

    if (!canAccessAdminRoutes(me?.user.role)) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/master"!</div>;
}

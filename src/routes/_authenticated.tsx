import { createFileRoute, redirect } from '@tanstack/react-router';
import { ErrorPage } from '@/components/error-page';
import { InsetNotFoundPage } from '@/components/not-found-page';
import { meQueryOptions } from '@/features/auth/api/use-me';
import { AuthenticatedLayout } from './_authenticated/-layout';

export const Route = createFileRoute('/_authenticated')({
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
  errorComponent: ErrorPage,
  notFoundComponent: InsetNotFoundPage,
});

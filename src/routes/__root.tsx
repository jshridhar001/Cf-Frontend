import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { NotFoundPage } from '@/components/not-found-page';
import type { RouterContext } from '../lib/router-context';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
  notFoundComponent: NotFoundPage,
});

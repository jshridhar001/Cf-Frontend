import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { NotFoundPage, RouterErrorComponent } from '@/features/system/components/status-pages';
import type { RouterContext } from '../lib/router-context';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
    </>
  ),
  notFoundComponent: NotFoundPage,
  errorComponent: RouterErrorComponent,
});

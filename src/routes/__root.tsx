import { createRootRouteWithContext, HeadContent, Outlet } from '@tanstack/react-router';
import type { RouterContext } from '../lib/router-context';

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [{ title: 'Contract Farming' }],
  }),
  component: () => (
    <>
      <HeadContent />
      <Outlet />
    </>
  ),
});

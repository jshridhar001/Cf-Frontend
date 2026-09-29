import { createRootRouteWithContext, HeadContent, Outlet } from '@tanstack/react-router';
import type { RouterContext } from '../lib/router-context';

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { title: 'Bhatti Agritech Contract Farming' },
      {
        name: 'description',
        content:
          'Bhatti Agritech’s contract-farming system for grower records, seed requisitions, and agreements.',
      },
    ],
  }),
  component: () => (
    <>
      <HeadContent />
      <Outlet />
    </>
  ),
});

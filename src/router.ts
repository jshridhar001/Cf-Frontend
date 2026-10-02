import { createRouter } from '@tanstack/react-router';
import { RouteErrorFallback } from '@/components/connection-status';
import { queryClient } from '@/lib/queryClient';
import { routeTree } from './routeTree.gen';

export const router = createRouter({
  routeTree,
  scrollToTopSelectors: ['[data-main-scroll]'],
  context: {
    queryClient,
  },
  defaultPreload: false,
  defaultErrorComponent: RouteErrorFallback,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

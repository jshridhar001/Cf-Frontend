import { createRouter } from '@tanstack/react-router';
import { ErrorPage } from '@/components/error-page';
import { NotFoundPage } from '@/components/not-found-page';
import { queryClient } from '@/lib/queryClient';
import { routeTree } from './routeTree.gen';

export const router = createRouter({
  routeTree,
  scrollToTopSelectors: ['[data-main-scroll]'],
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFoundPage,
  defaultErrorComponent: ErrorPage,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

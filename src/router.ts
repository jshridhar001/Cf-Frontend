import { createRouter } from '@tanstack/react-router';
import { NotFoundPage, RouterErrorComponent } from '@/features/system/components/status-pages';
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
  defaultErrorComponent: RouterErrorComponent,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

import { createFileRoute } from '@tanstack/react-router';
import { farmersQueryOptions } from '@/features/farmers/overview/api/use-farmers';
import FarmersOverviewPage from '@/features/farmers/overview/components/FarmersOverviewPage';

export const Route = createFileRoute('/_authenticated/farmers/overview')({
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(farmersQueryOptions());
  },
  component: FarmersOverviewPage,
});

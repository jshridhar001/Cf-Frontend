import { createFileRoute } from '@tanstack/react-router';
import { FarmersAnalyticsPage } from '@/features/farmers/analytics/components/FarmersAnalyticsPage';
import { farmersReportQueryOptions } from '@/features/farmers/report/api/use-farmers-report';

export const Route = createFileRoute('/_authenticated/farmers/analytics')({
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(farmersReportQueryOptions({}));
  },
  component: FarmersAnalyticsPage,
});

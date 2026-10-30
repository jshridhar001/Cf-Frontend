import { createFileRoute } from '@tanstack/react-router';
import { farmersReportQueryOptions } from '@/features/farmers/report/api/use-farmers-report';
import { FarmersReportPage } from '@/features/farmers/report/components/FarmersReportPage';

export const Route = createFileRoute('/_authenticated/farmers/report')({
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(farmersReportQueryOptions({}));
  },
  component: FarmersReportPage,
});

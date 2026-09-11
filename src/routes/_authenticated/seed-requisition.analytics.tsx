import { createFileRoute } from '@tanstack/react-router';
import SeedRequisitionAnalyticsPage from '@/features/seed-requisition/analytics/components/SeedRequisitionAnalyticsPage';

export const Route = createFileRoute('/_authenticated/seed-requisition/analytics')({
  component: SeedRequisitionAnalyticsPage,
});

import { createFileRoute } from '@tanstack/react-router';
import SeedRequisitionOverviewPage from '@/features/seed-requisition/overview/components/SeedRequisitionOverviewPage';
import { seedRequisitionSearchSchema } from '@/features/seed-requisition/overview/lib/search';

export const Route = createFileRoute('/_authenticated/seed-requisition/overview')({
  validateSearch: seedRequisitionSearchSchema,
  component: SeedRequisitionOverviewPage,
});

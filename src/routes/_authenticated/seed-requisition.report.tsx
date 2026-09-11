import { createFileRoute } from '@tanstack/react-router';
import SeedRequisitionReportPage from '@/features/seed-requisition/report/components/SeedRequisitionReportPage';

export const Route = createFileRoute('/_authenticated/seed-requisition/report')({
  component: SeedRequisitionReportPage,
});

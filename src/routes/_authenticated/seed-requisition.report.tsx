import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/seed-requisition/report')({
  component: SeedRequisitionReportPage,
});

function SeedRequisitionReportPage() {
  return <div>Seed Requisition — Report</div>;
}

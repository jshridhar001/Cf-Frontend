import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/seed-requisition/analytics')({
  component: SeedRequisitionAnalyticsPage,
});

function SeedRequisitionAnalyticsPage() {
  return <div>Seed Requisition — Analytics</div>;
}

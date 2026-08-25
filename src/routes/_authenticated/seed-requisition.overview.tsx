import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/seed-requisition/overview')({
  component: SeedRequisitionOverviewPage,
});

function SeedRequisitionOverviewPage() {
  return <div>Seed Requisition — Overview</div>;
}

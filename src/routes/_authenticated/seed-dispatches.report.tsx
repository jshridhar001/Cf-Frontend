import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/seed-dispatches/report')({
  component: SeedDispatchesReportPage,
});

function SeedDispatchesReportPage() {
  return <div>Seed-Dispatches — Report</div>;
}

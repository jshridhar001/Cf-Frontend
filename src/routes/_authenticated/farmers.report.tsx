import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/farmers/report')({
  component: FarmersReportPage,
});

function FarmersReportPage() {
  return <div>Farmers — Report</div>;
}

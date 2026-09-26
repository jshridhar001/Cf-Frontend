import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/farmers/analytics')({
  component: FarmersAnalyticsPage,
});

function FarmersAnalyticsPage() {
  return <div>Farmers — Analytics</div>;
}

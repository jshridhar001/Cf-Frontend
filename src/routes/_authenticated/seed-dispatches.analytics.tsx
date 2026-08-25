import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/seed-dispatches/analytics')({
  component: SeedDispatchesAnalyticsPage,
});

function SeedDispatchesAnalyticsPage() {
  return <div>Seed-Dispatches — Analytics</div>;
}

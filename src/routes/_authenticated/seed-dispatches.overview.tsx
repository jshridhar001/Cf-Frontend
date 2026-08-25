import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/seed-dispatches/overview')({
  component: SeedDispatchesOverviewPage,
});

function SeedDispatchesOverviewPage() {
  return <div>Seed-Dispatches — Overview</div>;
}

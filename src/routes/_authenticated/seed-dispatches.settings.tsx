import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/seed-dispatches/settings')({
  component: SeedDispatchesSettingsPage,
});

function SeedDispatchesSettingsPage() {
  return <div>Seed-Dispatches — Settings</div>;
}

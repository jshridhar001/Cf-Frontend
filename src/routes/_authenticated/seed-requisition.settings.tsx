import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/seed-requisition/settings')({
  component: SeedRequisitionSettingsPage,
});

function SeedRequisitionSettingsPage() {
  return <div>Seed Requisition — Settings</div>;
}

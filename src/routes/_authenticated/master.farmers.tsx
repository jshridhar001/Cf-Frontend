import { createFileRoute } from '@tanstack/react-router';
import { FarmersTabContent } from '@/features/master/components/farmers/FarmersTabContent';

export const Route = createFileRoute('/_authenticated/master/farmers')({
  component: MasterFarmersPage,
});

function MasterFarmersPage() {
  return <FarmersTabContent />;
}

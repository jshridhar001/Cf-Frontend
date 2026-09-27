import { createFileRoute } from '@tanstack/react-router';
import { farmersQueryOptions } from '@/features/farmers/overview/api/use-farmers';
import { FarmersTabContent } from '@/features/master/components/farmers/FarmersTabContent';

export const Route = createFileRoute('/_authenticated/master/farmers')({
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(farmersQueryOptions());
  },
  component: MasterFarmersPage,
});

function MasterFarmersPage() {
  return <FarmersTabContent />;
}

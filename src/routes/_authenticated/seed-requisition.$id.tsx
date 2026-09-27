import { createFileRoute, Outlet } from '@tanstack/react-router';
import { seedRequisitionQueryOptions } from '@/features/seed-requisition/overview/api/use-seed-requisition';

export const Route = createFileRoute('/_authenticated/seed-requisition/$id')({
  loader: ({ context, params }) => {
    void context.queryClient.prefetchQuery(seedRequisitionQueryOptions(params.id));
  },
  component: SeedRequisitionDetailLayout,
});

function SeedRequisitionDetailLayout() {
  return <Outlet />;
}

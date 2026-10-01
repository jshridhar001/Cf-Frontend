import { createFileRoute } from '@tanstack/react-router';
import { SeedDispatchDetailPage } from '@/features/seed-dispatch/detail/components/SeedDispatchDetailPage';
import { seedDispatchQueryOptions } from '@/features/seed-dispatch/overview/api/use-seed-dispatch';

export const Route = createFileRoute('/_authenticated/seed-dispatches/$id')({
  loader: ({ context, params }) => {
    void context.queryClient.prefetchQuery(seedDispatchQueryOptions(params.id));
  },
  component: SeedDispatchDetailRoute,
});

function SeedDispatchDetailRoute() {
  const { id } = Route.useParams();
  return <SeedDispatchDetailPage id={id} />;
}

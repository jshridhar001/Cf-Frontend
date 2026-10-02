import { createFileRoute } from '@tanstack/react-router';
import { FarmerProfilePage } from '@/features/farmers/farmer-profile/components/FarmerProfilePage';
import { farmersQueryOptions } from '@/features/farmers/overview/api/use-farmers';

export const Route = createFileRoute('/_authenticated/farmers/$id')({
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(farmersQueryOptions());
  },
  component: FarmerProfileRoute,
});

function FarmerProfileRoute() {
  const { id } = Route.useParams();
  return <FarmerProfilePage id={id} />;
}

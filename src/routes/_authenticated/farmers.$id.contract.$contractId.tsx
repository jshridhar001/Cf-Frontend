import { createFileRoute } from '@tanstack/react-router';
import FarmerContractDetailPage from '@/features/farmer-profile/components/FarmerContractDetailPage';
import { farmerQueryOptions } from '@/features/farmers/api/use-farmer';

export const Route = createFileRoute('/_authenticated/farmers/$id/contract/$contractId')({
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData(farmerQueryOptions(params.id));
    } catch {
      // Query error stays in cache; the page renders farmer not-found / error UI.
    }
  },
  component: FarmerContractDetailRoute,
});

function FarmerContractDetailRoute() {
  const { id, contractId } = Route.useParams();
  return <FarmerContractDetailPage id={id} contractId={contractId} />;
}

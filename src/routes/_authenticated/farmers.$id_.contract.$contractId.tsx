import { createFileRoute } from '@tanstack/react-router';
import FarmerContractDetailPage from '@/features/farmers/contract/components/FarmerContractDetailPage';

export const Route = createFileRoute('/_authenticated/farmers/$id_/contract/$contractId')({
  component: FarmerContractDetailRoute,
});

function FarmerContractDetailRoute() {
  const { id, contractId } = Route.useParams();
  return <FarmerContractDetailPage farmerId={id} contractId={contractId} />;
}

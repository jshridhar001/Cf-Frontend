import { createFileRoute } from '@tanstack/react-router';
import { ContractPage } from '@/features/seed-requisition/contract/components/ContractPage';

export const Route = createFileRoute('/_authenticated/seed-requisition/$id/contract')({
  component: SeedRequisitionContractPage,
});

function SeedRequisitionContractPage() {
  const { id } = Route.useParams();
  return <ContractPage id={id} />;
}

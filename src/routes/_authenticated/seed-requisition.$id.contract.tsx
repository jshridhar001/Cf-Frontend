import { createFileRoute } from '@tanstack/react-router';
import { SeedRequisitionJsonPage } from '@/features/seed-requisition/overview/components/seed-requisition-json-page';

export const Route = createFileRoute('/_authenticated/seed-requisition/$id/contract')({
  component: SeedRequisitionContractPage,
});

function SeedRequisitionContractPage() {
  const { id } = Route.useParams();
  return <SeedRequisitionJsonPage id={id} title="Contract" />;
}

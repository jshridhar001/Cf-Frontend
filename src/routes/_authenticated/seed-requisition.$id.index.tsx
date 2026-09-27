import { createFileRoute } from '@tanstack/react-router';
import { SeedRequisitionJsonPage } from '@/features/seed-requisition/overview/components/seed-requisition-json-page';

export const Route = createFileRoute('/_authenticated/seed-requisition/$id/')({
  component: SeedRequisitionDetailPage,
});

function SeedRequisitionDetailPage() {
  const { id } = Route.useParams();
  return <SeedRequisitionJsonPage id={id} title="Requisition" />;
}
